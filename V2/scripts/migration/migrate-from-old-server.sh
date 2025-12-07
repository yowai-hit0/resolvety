#!/bin/bash

# Complete migration script: Export from old server and import to new server
# This script handles the full migration process

set -e

OLD_SERVER="172.16.40.61"
OLD_DB_USER="admin"
OLD_DB_PASS="Zoea2025Secure"
OLD_DB_NAME="resolveit"

NEW_SERVER="159.198.65.38"
NEW_SERVER_USER="root"
NEW_SERVER_PASS="K1xrU3OT0Kjz671daI"

echo "🚀 ResolveIt Database Migration"
echo "================================"
echo ""
echo "Old Server: $OLD_SERVER"
echo "New Server: $NEW_SERVER"
echo ""

# Step 1: Try to export from old server
echo "📤 Step 1: Exporting from old server..."
EXPORT_FILE="resolveit_export_$(date +%Y%m%d_%H%M%S).sql"

# Try direct connection first
if command -v pg_dump &> /dev/null; then
    echo "   Attempting direct PostgreSQL connection..."
    if PGPASSWORD="$OLD_DB_PASS" pg_dump -h "$OLD_SERVER" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" \
        --no-owner --no-acl --clean --if-exists > "$EXPORT_FILE" 2>/dev/null; then
        echo "   ✅ Export successful via direct connection"
    else
        echo "   ⚠️  Direct connection failed, trying SSH..."
        # Try SSH
        if sshpass -p "$OLD_SERVER_PASS" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@"$OLD_SERVER" \
            "PGPASSWORD='$OLD_DB_PASS' pg_dump -h localhost -U $OLD_DB_USER -d $OLD_DB_NAME --no-owner --no-acl --clean --if-exists" \
            > "$EXPORT_FILE" 2>/dev/null; then
            echo "   ✅ Export successful via SSH"
        else
            echo "   ❌ Could not export from old server"
            echo "   Please export manually and provide the SQL file"
            exit 1
        fi
    fi
else
    echo "   ⚠️  pg_dump not found locally"
    echo "   Please install PostgreSQL client tools or export manually"
    exit 1
fi

# Step 2: Import to new server
echo ""
echo "📥 Step 2: Importing to new server..."
sshpass -p "$NEW_SERVER_PASS" scp -o StrictHostKeyChecking=no "$EXPORT_FILE" "$NEW_SERVER_USER@$NEW_SERVER:/tmp/"

sshpass -p "$NEW_SERVER_PASS" ssh -o StrictHostKeyChecking=no "$NEW_SERVER_USER@$NEW_SERVER" << ENDSSH
cd /opt/resolveit

echo "   Importing SQL file..."
docker exec -i devslab-postgres psql -U devslab_admin -d resolveit_db < /tmp/$(basename $EXPORT_FILE)

# Clean up
rm /tmp/$(basename $EXPORT_FILE)

echo "   ✅ Import completed"
ENDSSH

echo ""
echo "✅ Migration completed!"
echo ""
echo "⚠️  Next steps:"
echo "   1. The data is imported but uses old schema (Int IDs)"
echo "   2. Run the TypeScript migration script to convert to UUID format:"
echo "      docker exec -it resolveit-backend node dist/scripts/migrate-data.js"
echo ""

