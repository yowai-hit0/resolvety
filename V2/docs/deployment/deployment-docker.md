# Docker Setup for ResolveIt v2

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your production values:**
   - Set strong `POSTGRES_PASSWORD`
   - Set secure `JWT_SECRET`
   - Update URLs for production

3. **Build and start:**
   ```bash
   docker-compose up -d --build
   ```

4. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Using Make Commands

```bash
make build      # Build images
make up         # Start services
make down       # Stop services
make logs       # View logs
make migrate    # Run migrations
make backup     # Backup database
```

## Ports

- Backend API: `3000`
- Frontend UI: `3001`
- PostgreSQL: `5433` (to avoid conflicts with Laravel)

## Documentation

See [deployment-guide.md](./deployment-guide.md) for detailed deployment instructions.

## Using Makefile

The Makefile is located in `scripts/Makefile`. To use it:

```bash
cd scripts
make build      # Build images
make up         # Start services
make logs       # View logs
```

