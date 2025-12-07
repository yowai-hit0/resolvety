#!/bin/bash

# DevLabs PostgreSQL Setup Script
# This script sets up the shared DevLabs PostgreSQL container

set -e

echo "🚀 Setting up DevLabs PostgreSQL Container..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Load environment variables
if [ -f .env.devlabs ]; then
    export $(cat .env.devlabs | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env.devlabs"
else
    echo "⚠️  .env.devlabs not found. Using defaults."
    export POSTGRES_USER=devslab_admin
    export POSTGRES_PASSWORD=devslab_secure_password_2024
    export POSTGRES_PORT=5433
fi

# Start DevLabs PostgreSQL
echo "📦 Starting DevLabs PostgreSQL container..."
docker-compose -f docker-compose.devlabs-db.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if container is running
if docker ps | grep -q devslab-postgres; then
    echo "✅ DevLabs PostgreSQL container is running"
else
    echo "❌ Failed to start DevLabs PostgreSQL container"
    docker logs devslab-postgres
    exit 1
fi

# Create ResolveIt database
echo "🗄️  Creating ResolveIt database..."
docker exec -i devslab-postgres psql -U ${POSTGRES_USER:-devslab_admin} -d postgres << EOF
-- Create ResolveIt database
CREATE DATABASE resolveit_db;

-- Create ResolveIt user (optional but recommended)
CREATE USER resolveit_user WITH PASSWORD 'resolveit_secure_password_2024';
GRANT ALL PRIVILEGES ON DATABASE resolveit_db TO resolveit_user;

-- List all databases
\l
EOF

echo ""
echo "✅ DevLabs PostgreSQL setup complete!"
echo ""
echo "📋 Connection Details:"
echo "   Host: localhost (or devslab-postgres from Docker network)"
echo "   Port: ${POSTGRES_PORT:-5433}"
echo "   Admin User: ${POSTGRES_USER:-devslab_admin}"
echo "   Admin Password: ${POSTGRES_PASSWORD:-devslab_secure_password_2024}"
echo ""
echo "📋 ResolveIt Database:"
echo "   Database: resolveit_db"
echo "   User: resolveit_user"
echo "   Password: resolveit_secure_password_2024"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://devslab_admin:devslab_secure_password_2024@localhost:5433/resolveit_db"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env.devlabs with secure passwords"
echo "   2. Start ResolveIt: docker-compose -f docker-compose.resolveit.yml up -d --build"
echo ""

