#!/bin/bash

# Script to export data from old server (172.16.40.61)
# Run this on a machine that has access to the old server

set -e

OLD_SERVER="172.16.40.61"
OLD_DB_USER="admin"
OLD_DB_PASS="Zoea2025Secure"
OLD_DB_NAME="resolveit"
EXPORT_FILE="resolveit_export_$(date +%Y%m%d_%H%M%S).sql"

echo "📤 Exporting database from old server..."
echo "=========================================="
echo ""

# Method 1: Direct PostgreSQL dump (if accessible)
if command -v pg_dump &> /dev/null; then
    echo "Using pg_dump to export..."
    PGPASSWORD="$OLD_DB_PASS" pg_dump -h "$OLD_SERVER" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" \
        --no-owner --no-acl --clean --if-exists > "$EXPORT_FILE"
    echo "✅ Export completed: $EXPORT_FILE"
    exit 0
fi

# Method 2: SSH to old server and dump
echo "Attempting SSH connection to old server..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@"$OLD_SERVER" "command -v pg_dump" &>/dev/null; then
    echo "Exporting via SSH..."
    ssh root@"$OLD_SERVER" "PGPASSWORD='$OLD_DB_PASS' pg_dump -h localhost -U $OLD_DB_USER -d $OLD_DB_NAME --no-owner --no-acl --clean --if-exists" > "$EXPORT_FILE"
    echo "✅ Export completed: $EXPORT_FILE"
    exit 0
fi

# Method 3: Docker exec if PostgreSQL is in Docker
echo "Attempting Docker export..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@"$OLD_SERVER" "docker ps | grep postgres" &>/dev/null; then
    CONTAINER=$(ssh root@"$OLD_SERVER" "docker ps | grep postgres | awk '{print \$1}' | head -1")
    echo "Found PostgreSQL container: $CONTAINER"
    ssh root@"$OLD_SERVER" "docker exec $CONTAINER pg_dump -U $OLD_DB_USER -d $OLD_DB_NAME --no-owner --no-acl --clean --if-exists" > "$EXPORT_FILE"
    echo "✅ Export completed: $EXPORT_FILE"
    exit 0
fi

echo "❌ Could not export database. Please run manually:"
echo "   pg_dump -h $OLD_SERVER -U $OLD_DB_USER -d $OLD_DB_NAME > $EXPORT_FILE"
exit 1

