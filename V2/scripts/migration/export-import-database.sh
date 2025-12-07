#!/bin/bash

# Script to export database from 172.16.40.61 and import to 159.198.65.38
# This ensures we have the latest data on the production server

set -e

# Source database (old server)
OLD_SERVER="172.16.40.61"
OLD_DB_USER="admin"
OLD_DB_PASS="Zoea2025Secure"
OLD_DB_NAME="resolveit"
OLD_DB_PORT="5432"

# Destination database (new server)
NEW_SERVER="159.198.65.38"
NEW_SERVER_USER="root"
NEW_SERVER_PASS="K1xrU3OT0Kjz671daI"
NEW_DB_USER="devslab_admin"
NEW_DB_PASS="devslab_secure_password_2024"
NEW_DB_NAME="resolveit_db"
NEW_DB_PORT="5433"
NEW_CONTAINER="devslab-postgres"

# Export file
EXPORT_FILE="resolveit_export_$(date +%Y%m%d_%H%M%S).sql"
EXPORT_DIR="/tmp"

echo "🚀 ResolveIt Database Export & Import"
echo "======================================="
echo ""
echo "📤 Source: $OLD_SERVER:$OLD_DB_PORT/$OLD_DB_NAME"
echo "📥 Destination: $NEW_SERVER:$NEW_DB_PORT/$NEW_DB_NAME"
echo ""

# Step 1: Export from old server
echo "📤 Step 1: Exporting database from $OLD_SERVER..."
echo "   Database: $OLD_DB_NAME"
echo "   User: $OLD_DB_USER"
echo ""

# Try direct connection first
if PGPASSWORD="$OLD_DB_PASS" pg_dump -h "$OLD_SERVER" -p "$OLD_DB_PORT" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    --exclude-table=*_prisma_migrations \
    > "$EXPORT_DIR/$EXPORT_FILE" 2>&1; then
    echo "   ✅ Export successful via direct connection"
    EXPORT_SIZE=$(du -h "$EXPORT_DIR/$EXPORT_FILE" | cut -f1)
    echo "   📦 Export file size: $EXPORT_SIZE"
else
    echo "   ⚠️  Direct connection failed, trying SSH..."
    
    # Try SSH connection
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@"$OLD_SERVER" \
        "PGPASSWORD='$OLD_DB_PASS' pg_dump -h localhost -p $OLD_DB_PORT -U $OLD_DB_USER -d $OLD_DB_NAME --no-owner --no-acl --clean --if-exists --exclude-table=*_prisma_migrations" \
        > "$EXPORT_DIR/$EXPORT_FILE" 2>&1; then
        echo "   ✅ Export successful via SSH"
        EXPORT_SIZE=$(du -h "$EXPORT_DIR/$EXPORT_FILE" | cut -f1)
        echo "   📦 Export file size: $EXPORT_SIZE"
    else
        echo "   ❌ Could not export from old server"
        echo "   Error details:"
        tail -5 "$EXPORT_DIR/$EXPORT_FILE" 2>/dev/null || echo "   No error file generated"
        exit 1
    fi
fi

# Verify export file
if [ ! -s "$EXPORT_DIR/$EXPORT_FILE" ]; then
    echo "   ❌ Export file is empty or does not exist"
    exit 1
fi

echo ""
echo "📥 Step 2: Importing to $NEW_SERVER..."
echo "   Database: $NEW_DB_NAME"
echo "   Container: $NEW_CONTAINER"
echo ""

# Step 2: Copy export file to new server
echo "   📤 Uploading export file to server..."
if sshpass -p "$NEW_SERVER_PASS" scp -o StrictHostKeyChecking=no "$EXPORT_DIR/$EXPORT_FILE" "$NEW_SERVER_USER@$NEW_SERVER:/tmp/" 2>&1; then
    echo "   ✅ File uploaded successfully"
else
    echo "   ❌ Failed to upload file"
    exit 1
fi

# Step 3: Create backup before import
echo ""
echo "💾 Step 3: Creating backup of destination database..."
BACKUP_FILE="resolveit_db_backup_$(date +%Y%m%d_%H%M%S).sql"
sshpass -p "$NEW_SERVER_PASS" ssh -o StrictHostKeyChecking=no "$NEW_SERVER_USER@$NEW_SERVER" << ENDSSH
set -e
cd /opt/resolveit

# Check if container is running
if ! docker ps | grep -q "$NEW_CONTAINER"; then
    echo "   ⚠️  Container $NEW_CONTAINER is not running. Starting it..."
    docker compose -f docker-compose.devlabs-db.yml up -d
    sleep 5
fi

# Create backup
echo "   📦 Creating backup: $BACKUP_FILE"
if docker exec $NEW_CONTAINER psql -U $NEW_DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$NEW_DB_NAME'" | grep -q 1; then
    docker exec $NEW_CONTAINER pg_dump -U $NEW_DB_USER -d $NEW_DB_NAME --no-owner --no-acl > "/tmp/$BACKUP_FILE" 2>&1
    if [ -s "/tmp/$BACKUP_FILE" ]; then
        BACKUP_SIZE=\$(du -h "/tmp/$BACKUP_FILE" | cut -f1)
        echo "   ✅ Backup created: $BACKUP_FILE (\$BACKUP_SIZE)"
    else
        echo "   ⚠️  Backup file is empty (database might be empty)"
    fi
else
    echo "   ℹ️  Database doesn't exist yet, skipping backup"
fi
ENDSSH

# Step 4: Import to new server
echo ""
echo "📥 Step 4: Importing database..."
sshpass -p "$NEW_SERVER_PASS" ssh -o StrictHostKeyChecking=no "$NEW_SERVER_USER@$NEW_SERVER" << ENDSSH
set -e

cd /opt/resolveit

# Check if container is running
if ! docker ps | grep -q "$NEW_CONTAINER"; then
    echo "   ⚠️  Container $NEW_CONTAINER is not running. Starting it..."
    docker compose -f docker-compose.devlabs-db.yml up -d
    sleep 5
fi

# Ensure database exists
echo "   🔍 Checking if database exists..."
docker exec -i $NEW_CONTAINER psql -U $NEW_DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$NEW_DB_NAME'" | grep -q 1 || \
docker exec -i $NEW_CONTAINER psql -U $NEW_DB_USER -d postgres -c "CREATE DATABASE $NEW_DB_NAME;"

# Drop existing connections to allow clean import
echo "   🔄 Terminating existing connections..."
docker exec -i $NEW_CONTAINER psql -U $NEW_DB_USER -d postgres << 'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$NEW_DB_NAME' AND pid <> pg_backend_pid();
SQL

# Import the database
echo "   📥 Importing SQL file..."
if docker exec -i $NEW_CONTAINER psql -U $NEW_DB_USER -d $NEW_DB_NAME < /tmp/$EXPORT_FILE 2>&1; then
    echo "   ✅ Import completed successfully"
else
    echo "   ⚠️  Import completed with warnings (check output above)"
fi

# Verify import
echo ""
echo "   🔍 Verifying import..."
RECORD_COUNTS=\$(docker exec -i $NEW_CONTAINER psql -U $NEW_DB_USER -d $NEW_DB_NAME -t << 'SQL'
SELECT 
    'Users: ' || COUNT(*) FROM users
UNION ALL
SELECT 
    'Tickets: ' || COUNT(*) FROM tickets
UNION ALL
SELECT 
    'Comments: ' || COUNT(*) FROM comments
UNION ALL
SELECT 
    'Attachments: ' || COUNT(*) FROM attachments
UNION ALL
SELECT 
    'Categories: ' || COUNT(*) FROM categories;
SQL
)
echo "\$RECORD_COUNTS"

# Clean up
echo "   🧹 Cleaning up..."
rm -f /tmp/$EXPORT_FILE
echo "   ✅ Cleanup completed"

ENDSSH

# Clean up local export file
echo ""
echo "🧹 Cleaning up local files..."
rm -f "$EXPORT_DIR/$EXPORT_FILE"
echo "   ✅ Local cleanup completed"

echo ""
echo "✅ Database migration completed successfully!"
echo ""
echo "📊 Summary:"
echo "   Source: $OLD_SERVER:$OLD_DB_PORT/$OLD_DB_NAME"
echo "   Destination: $NEW_SERVER:$NEW_DB_PORT/$NEW_DB_NAME"
echo "   Export file: $EXPORT_FILE (removed)"
echo "   Backup file: $BACKUP_FILE (saved on server)"
echo ""
echo "🔍 Data Integrity Verification:"
echo "   Run the verification script to ensure no data loss:"
echo "   ./scripts/migration/verify-data-integrity.sh"
echo ""
echo "⚠️  Next steps:"
echo "   1. Run data integrity verification:"
echo "      ./scripts/migration/verify-data-integrity.sh"
echo "   2. Test the application to ensure everything works"
echo "   3. Run Prisma migrations if schema changed:"
echo "      ssh root@$NEW_SERVER 'cd /opt/resolveit/backend && npm run prisma:migrate'"
echo ""
echo "💾 Backup Information:"
echo "   Backup location: /tmp/$BACKUP_FILE on $NEW_SERVER"
echo "   To restore backup if needed:"
echo "   ssh root@$NEW_SERVER 'docker exec -i devslab-postgres psql -U devslab_admin -d resolveit_db < /tmp/$BACKUP_FILE'"
echo ""

