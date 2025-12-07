# Quick Deployment Guide

## One-Command Deployment

Run this from your local machine:

```bash
cd /Applications/AMPPS/www/resolveit/v2
./scripts/deployment/deploy-to-server.sh
```

This script will:
1. ✅ Upload all files to the server
2. ✅ Set up DevLabs PostgreSQL container
3. ✅ Create ResolveIt database
4. ✅ Build and start ResolveIt containers
5. ✅ Show you the access URLs

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### 1. Upload Files to Server

```bash
# Use the deployment script
./scripts/deployment/deploy-to-server.sh
```

### 2. SSH to Server

```bash
sshpass -p 'K1xrU3OT0Kjz671daI' ssh root@159.198.65.38
cd /opt/resolveit
```

### 3. Start DevLabs PostgreSQL

```bash
docker-compose -f docker-compose.devlabs-db.yml --env-file .env.devlabs up -d
```

### 4. Create ResolveIt Database

```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE DATABASE resolveit_db;"
```

### 5. Start ResolveIt

```bash
docker-compose -f docker-compose.resolveit.yml --env-file .env.devlabs up -d --build
```

## Access Your Application

- **Frontend**: http://159.198.65.38:3001
- **Backend API**: http://159.198.65.38:3000/api
- **API Docs**: http://159.198.65.38:3000/api/docs

## Check Status

```bash
sshpass -p 'K1xrU3OT0Kjz671daI' ssh root@159.198.65.38 'cd /opt/resolveit && docker-compose -f docker-compose.resolveit.yml ps'
```

## View Logs

```bash
sshpass -p 'K1xrU3OT0Kjz671daI' ssh root@159.198.65.38 'cd /opt/resolveit && docker-compose -f docker-compose.resolveit.yml logs -f'
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker logs devslab-postgres
docker logs resolveit-backend
docker logs resolveit-frontend
```

### Database connection issues
```bash
# Test database connection
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db
```

### Rebuild containers
```bash
docker-compose -f docker-compose.resolveit.yml down
docker-compose -f docker-compose.resolveit.yml up -d --build
```

