#!/bin/bash

# Script to import exported SQL file into new server database
# Usage: ./import-to-new-server.sh <export_file.sql>

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <export_file.sql>"
    exit 1
fi

EXPORT_FILE="$1"
NEW_SERVER="159.198.65.38"
NEW_DB_USER="devslab_admin"
NEW_DB_PASS="devslab_secure_password_2024"
NEW_DB_NAME="resolveit_db"
NEW_DB_HOST="devslab-postgres"
NEW_DB_PORT="5432"

if [ ! -f "$EXPORT_FILE" ]; then
    echo "❌ File not found: $EXPORT_FILE"
    exit 1
fi

echo "📥 Importing database to new server..."
echo "=========================================="
echo ""

# Upload file to server
echo "📤 Uploading export file to server..."
sshpass -p 'K1xrU3OT0Kjz671daI' scp -o StrictHostKeyChecking=no "$EXPORT_FILE" root@"$NEW_SERVER":/tmp/

# Import into database
echo "📥 Importing into database..."
sshpass -p 'K1xrU3OT0Kjz671daI' ssh -o StrictHostKeyChecking=no root@"$NEW_SERVER" << ENDSSH
cd /opt/resolveit

# Import the SQL file
docker exec -i devslab-postgres psql -U $NEW_DB_USER -d $NEW_DB_NAME < /tmp/$(basename $EXPORT_FILE)

# Clean up
rm /tmp/$(basename $EXPORT_FILE)

echo "✅ Import completed!"
ENDSSH

echo ""
echo "✅ Database import completed!"
echo ""
echo "⚠️  Note: The imported data uses old schema (Int IDs)."
echo "   You may need to run the migration script to convert to UUID format."

