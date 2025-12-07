# ResolveIt V2 Port Configuration

## Service Ports

Each service runs on its own unique port:

### Backend API (NestJS)
- **Host Port**: `3000`
- **Container Port**: `3000`
- **URL**: `http://159.198.65.38:3000/api`
- **API Docs**: `http://159.198.65.38:3000/api/docs`

### Frontend UI (Next.js)
- **Host Port**: `3001`
- **Container Port**: `3001`
- **URL**: `http://159.198.65.38:3001`

### PostgreSQL Database (DevLabs)
- **Host Port**: `5433`
- **Container Port**: `5432`
- **Internal Network**: `devslab-postgres:5432`
- **External Access**: `localhost:5433`

## Port Configuration in Environment

Set in `.env.devlabs`:
```bash
BACKEND_PORT=3000
FRONTEND_PORT=3001
POSTGRES_PORT=5433
```

## Network Configuration

- All services use the `devslab-network` Docker network
- Backend connects to PostgreSQL via: `devslab-postgres:5432`
- Frontend connects to Backend via: `http://159.198.65.38:3000/api`

## Verification

Check ports are in use:
```bash
netstat -tulpn | grep -E "3000|3001|5433"
```

Check containers:
```bash
docker compose -f docker-compose.resolveit.yml ps
docker ps | grep resolveit
```

