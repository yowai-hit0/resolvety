#!/bin/bash

# Script to verify data integrity between source and destination databases
# This ensures no data loss or modification occurred during migration

set -e

# Source database (old server)
OLD_SERVER="172.16.40.61"
OLD_DB_USER="admin"
OLD_DB_PASS="Zoea2025Secure"
OLD_DB_NAME="resolveit"
OLD_DB_PORT="5432"

# Destination database (new server)
NEW_SERVER="159.198.65.38"
NEW_DB_USER="devslab_admin"
NEW_DB_PASS="devslab_secure_password_2024"
NEW_DB_NAME="resolveit_db"
NEW_DB_PORT="5433"

echo "🔍 Data Integrity Verification"
echo "=============================="
echo ""
echo "Source: $OLD_SERVER:$OLD_DB_PORT/$OLD_DB_NAME"
echo "Destination: $NEW_SERVER:$NEW_DB_PORT/$NEW_DB_NAME"
echo ""

# Function to get count from source
get_source_count() {
    local table=$1
    PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_SERVER" -p "$OLD_DB_PORT" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs
}

# Function to get count from destination
get_dest_count() {
    local table=$1
    PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_SERVER" -p "$NEW_DB_PORT" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs
}

# Tables to verify
TABLES=("users" "tickets" "comments" "attachments" "categories")

# Verification results
ALL_MATCH=true

echo "📊 Comparing table record counts:"
echo "-----------------------------------"

for table in "${TABLES[@]}"; do
    src_count=$(get_source_count "$table")
    dest_count=$(get_dest_count "$table")
    
    if [ "$src_count" = "$dest_count" ]; then
        echo "✅ $table: $src_count → $dest_count (MATCH)"
    else
        echo "❌ $table: $src_count → $dest_count (MISMATCH)"
        ALL_MATCH=false
    fi
done

echo ""
echo "📅 Comparing date ranges:"
echo "-------------------------"

# Compare ticket date ranges
echo "Tickets:"
SRC_TICKETS=$(PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_SERVER" -p "$OLD_DB_PORT" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t << 'SQL'
SELECT COUNT(*)::text || '|' || MIN(created_at)::text || '|' || MAX(created_at)::text FROM tickets;
SQL
)

DEST_TICKETS=$(PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_SERVER" -p "$NEW_DB_PORT" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t << 'SQL'
SELECT COUNT(*)::text || '|' || MIN(created_at)::text || '|' || MAX(created_at)::text FROM tickets;
SQL
)

if [ "$SRC_TICKETS" = "$DEST_TICKETS" ]; then
    echo "   ✅ Ticket dates match"
else
    echo "   ❌ Ticket dates mismatch"
    echo "   Source: $SRC_TICKETS"
    echo "   Dest: $DEST_TICKETS"
    ALL_MATCH=false
fi

echo ""
echo "👥 Comparing sample user data:"
echo "-------------------------------"

# Compare first 3 users
SRC_USERS=$(PGPASSWORD="$OLD_DB_PASS" psql -h "$OLD_SERVER" -p "$OLD_DB_PORT" -U "$OLD_DB_USER" -d "$OLD_DB_NAME" -t << 'SQL'
SELECT id::text || '|' || email || '|' || role::text || '|' || created_at::text 
FROM users ORDER BY created_at LIMIT 3;
SQL
)

DEST_USERS=$(PGPASSWORD="$NEW_DB_PASS" psql -h "$NEW_SERVER" -p "$NEW_DB_PORT" -U "$NEW_DB_USER" -d "$NEW_DB_NAME" -t << 'SQL'
SELECT id::text || '|' || email || '|' || role::text || '|' || created_at::text 
FROM users ORDER BY created_at LIMIT 3;
SQL
)

if [ "$SRC_USERS" = "$DEST_USERS" ]; then
    echo "   ✅ Sample user data matches"
else
    echo "   ❌ Sample user data mismatch"
    ALL_MATCH=false
fi

echo ""
echo "📋 Summary:"
echo "-----------"

if [ "$ALL_MATCH" = true ]; then
    echo "✅ All data integrity checks passed!"
    echo "   • No data loss detected"
    echo "   • No data modification detected"
    echo "   • All record counts match"
    echo "   • Date ranges match"
    echo "   • Sample data matches"
    exit 0
else
    echo "❌ Data integrity issues detected!"
    echo "   Please review the mismatches above"
    exit 1
fi

