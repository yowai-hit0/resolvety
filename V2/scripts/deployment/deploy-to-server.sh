#!/bin/bash

# Complete Deployment Script for ResolveIt to Server
# This script sets up DevLabs PostgreSQL and deploys ResolveIt

set -e

SERVER_IP="159.198.65.38"
SERVER_USER="root"
SERVER_PASS="K1xrU3OT0Kjz671daI"
DEPLOY_PATH="/opt/resolveit"

echo "🚀 Starting ResolveIt Deployment to Server..."
echo "================================================"

# Step 1: Upload files to server
echo ""
echo "📤 Step 1: Uploading files to server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_PATH"

# Upload project files
echo "   Uploading project files..."
# Create a temporary tar archive excluding unnecessary files
tar --exclude='node_modules' --exclude='.next' --exclude='dist' \
    --exclude='.git' --exclude='*.log' --exclude='.env*' \
    -czf /tmp/resolveit-deploy.tar.gz .
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no /tmp/resolveit-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $DEPLOY_PATH && tar -xzf /tmp/resolveit-deploy.tar.gz && rm /tmp/resolveit-deploy.tar.gz"
rm /tmp/resolveit-deploy.tar.gz

# Step 2: Setup DevLabs PostgreSQL
echo ""
echo "🗄️  Step 2: Setting up DevLabs PostgreSQL..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/resolveit

# Load environment variables
export POSTGRES_USER=devslab_admin
export POSTGRES_PASSWORD=devslab_secure_password_2024
export POSTGRES_PORT=5433

# Start DevLabs PostgreSQL
echo "   Starting DevLabs PostgreSQL container..."
docker compose -f docker-compose.devlabs-db.yml up -d

# Wait for PostgreSQL to be ready
echo "   Waiting for PostgreSQL to be ready..."
sleep 10

# Check if container is running
if docker ps | grep -q devslab-postgres; then
    echo "   ✅ DevLabs PostgreSQL is running"
else
    echo "   ❌ Failed to start PostgreSQL"
    docker logs devslab-postgres
    exit 1
fi

# Create ResolveIt database
echo "   Creating ResolveIt database..."
docker exec -i devslab-postgres psql -U devslab_admin -d postgres << 'EOF'
-- Create ResolveIt database if not exists
SELECT 'CREATE DATABASE resolveit_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'resolveit_db')\gexec

-- Create ResolveIt user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'resolveit_user') THEN
        CREATE USER resolveit_user WITH PASSWORD 'resolveit_secure_password_2024';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE resolveit_db TO resolveit_user;

-- List databases
\l
EOF

echo "   ✅ ResolveIt database created"
ENDSSH

# Step 3: Build and start ResolveIt
echo ""
echo "🔨 Step 3: Building and starting ResolveIt..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/resolveit

# Ensure DevLabs network exists (created by devlabs-db compose)
docker network create devslab-network 2>/dev/null || true

# Update .env.devlabs with correct DATABASE_URL
cat > .env.devlabs << 'EOF'
# DevLabs PostgreSQL Configuration
POSTGRES_USER=devslab_admin
POSTGRES_PASSWORD=devslab_secure_password_2024
POSTGRES_DB=postgres
POSTGRES_PORT=5433

# ResolveIt Configuration
BACKEND_PORT=3000
FRONTEND_PORT=3001
JWT_SECRET=resolveit_jwt_secret_production_2024_change_me
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3001,http://localhost:3000,http://159.198.65.38:3001
NEXT_PUBLIC_API_BASE=http://159.198.65.38:3000/api

# Database connection for ResolveIt backend
DATABASE_URL=postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db
EOF

# Build and start ResolveIt
echo "   Building ResolveIt containers..."
docker compose -f docker-compose.resolveit.yml --env-file .env.devlabs build

echo "   Starting ResolveIt containers..."
docker compose -f docker-compose.resolveit.yml --env-file .env.devlabs up -d

# Wait a bit for services to start
sleep 10

# Check status
echo ""
echo "   📊 Container Status:"
docker compose -f docker-compose.resolveit.yml ps

echo ""
echo "   📋 Service URLs:"
echo "   - Backend API: http://159.198.65.38:3000/api"
echo "   - Frontend UI: http://159.198.65.38:3001"
echo "   - API Docs: http://159.198.65.38:3000/api/docs"
ENDSSH

echo ""
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://159.198.65.38:3001"
echo "   Backend API: http://159.198.65.38:3000/api"
echo "   API Docs: http://159.198.65.38:3000/api/docs"
echo ""
echo "📋 DevLabs PostgreSQL Credentials:"
echo "   Host: localhost:5433"
echo "   User: devslab_admin"
echo "   Password: devslab_secure_password_2024"
echo "   Database: resolveit_db"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs: ssh root@159.198.65.38 'cd /opt/resolveit && docker compose -f docker-compose.resolveit.yml logs -f'"
echo "   Restart: ssh root@159.198.65.38 'cd /opt/resolveit && docker compose -f docker-compose.resolveit.yml restart'"
echo "   Stop: ssh root@159.198.65.38 'cd /opt/resolveit && docker compose -f docker-compose.resolveit.yml down'"
echo ""

