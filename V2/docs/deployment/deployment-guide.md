# ResolveIt v2 Docker Deployment Guide

This guide explains how to deploy ResolveIt v2 using Docker on a server that already hosts a Laravel application.

## Prerequisites

- Docker and Docker Compose installed on the server
- Ports available: 3000 (backend), 3001 (frontend), 5433 (PostgreSQL - optional, can use external DB)
- Root or sudo access to the server

## Architecture

The application consists of three Docker containers:
1. **PostgreSQL Database** - Stores all application data
2. **Backend API** (NestJS) - REST API on port 3000
3. **Frontend UI** (Next.js) - Web interface on port 3001

## Quick Start

### 1. Clone and Navigate to Project

```bash
cd /path/to/resolveit/V2
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
nano .env  # Edit with your production values
```

**Important variables to update:**
- `POSTGRES_PASSWORD` - Strong password for database
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `NEXT_PUBLIC_API_BASE` - Your backend API URL (e.g., `https://api.yourdomain.com/api`)
- `CORS_ORIGIN` - Your frontend URL (e.g., `https://yourdomain.com`)

### 3. Build and Start Containers

```bash
docker-compose up -d --build
```

This will:
- Build the backend and frontend images
- Start PostgreSQL database
- Run database migrations
- Start backend API
- Start frontend UI

### 4. Check Status

```bash
docker-compose ps
docker-compose logs -f
```

## Port Configuration

To avoid conflicts with your existing Laravel app, the default ports are:

- **Backend API**: `3000` (configurable via `BACKEND_PORT`)
- **Frontend UI**: `3001` (configurable via `FRONTEND_PORT`)
- **PostgreSQL**: `5433` (configurable via `POSTGRES_PORT`)

If you need different ports, update the `.env` file and `docker-compose.yml`.

## Using External Database

If you want to use an existing PostgreSQL database instead of the containerized one:

1. Remove or comment out the `postgres` service in `docker-compose.yml`
2. Update `DATABASE_URL` in the backend environment:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. Run migrations manually:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

## Reverse Proxy Setup (Nginx)

If you want to use a reverse proxy (recommended for production):

### Nginx Configuration Example

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend UI
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Then update your `.env`:
```
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Run Database Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Access Database
```bash
docker-compose exec postgres psql -U resolveit -d resolveit_db
```

### Run Prisma Studio (Database GUI)
```bash
docker-compose exec backend npx prisma studio
# Then access at http://localhost:5555
```

## Health Checks

All services include health checks. Check status:

```bash
docker-compose ps
```

Healthy services will show `(healthy)` status.

## Troubleshooting

### Backend won't start
1. Check database connection:
   ```bash
   docker-compose logs postgres
   docker-compose logs backend
   ```
2. Verify `DATABASE_URL` in `.env` matches PostgreSQL credentials
3. Ensure database is ready before backend starts (healthcheck handles this)

### Frontend can't connect to backend
1. Verify `NEXT_PUBLIC_API_BASE` in `.env` is correct
2. Check CORS settings in backend
3. Verify both containers are on the same network:
   ```bash
   docker network inspect resolveit_resolveit-network
   ```

### Port conflicts
1. Check if ports are already in use:
   ```bash
   netstat -tulpn | grep -E '3000|3001|5433'
   ```
2. Update ports in `.env` file
3. Restart containers: `docker-compose down && docker-compose up -d`

### Database connection errors
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check database logs: `docker-compose logs postgres`
3. Verify credentials in `.env` match PostgreSQL environment variables

## Production Considerations

1. **Security**:
   - Use strong passwords for database and JWT secret
   - Enable HTTPS with SSL certificates
   - Use a reverse proxy (Nginx/Apache)
   - Regularly update Docker images

2. **Backups**:
   - Backup PostgreSQL data volume regularly
   - Use `docker-compose exec postgres pg_dump -U resolveit resolveit_db > backup.sql`

3. **Monitoring**:
   - Set up log aggregation
   - Monitor container health
   - Set up alerts for service failures

4. **Performance**:
   - Adjust resource limits in `docker-compose.yml` if needed
   - Consider using Docker Swarm or Kubernetes for scaling

## Updating the Application

1. Pull latest code changes
2. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```
3. Run migrations if schema changed:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

## Support

For issues or questions, check the logs first:
```bash
docker-compose logs --tail=100
```

