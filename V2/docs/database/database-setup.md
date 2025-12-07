# Database Setup Instructions

## Database Server Information

**Production Database Server:**
- **Server:** `159.198.65.38`
- **Port:** `5433` (external), `5432` (internal Docker network)
- **Database:** `resolveit_db`
- **User:** `devslab_admin`
- **Password:** `devslab_secure_password_2024`
- **Container:** `devslab-postgres`
- **Network:** `devslab-network`

## Setup Steps

### 1. Start DevLabs PostgreSQL Container

The database is managed via Docker Compose:

```bash
cd /opt/resolveit
docker compose -f docker-compose.devlabs-db.yml up -d
```

### 2. Create ResolveIt Database

Connect to PostgreSQL and create the database:

```bash
# Option 1: Using Docker exec
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE DATABASE resolveit_db;"

# Option 2: Connect interactively
docker exec -it devslab-postgres psql -U devslab_admin -d postgres
# Then run: CREATE DATABASE resolveit_db;
```

### 3. Update Environment Variables

Ensure `.env.devlabs` has:
```env
DATABASE_URL=postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db
```

### 4. Run Migration

```bash
cd backend
npm run prisma:migrate
# Or
npx prisma migrate deploy
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Verify Connection

```bash
# Using Prisma Studio
npx prisma studio

# Or using psql
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db
```

## Connection Details

### From Host Machine (External Access)
```
Host: 159.198.65.38
Port: 5433
Database: resolveit_db
Username: devslab_admin
Password: devslab_secure_password_2024
```

**Connection String:**
```
postgresql://devslab_admin:devslab_secure_password_2024@159.198.65.38:5433/resolveit_db
```

### From Docker Containers (Internal Network)
```
Host: devslab-postgres
Port: 5432
Database: resolveit_db
Username: devslab_admin
Password: devslab_secure_password_2024
```

**Connection String:**
```
postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db
```

## Database Information

- **Container Name:** `devslab-postgres`
- **Network:** `devslab-network`
- **Volume:** `devslab_postgres_data`
- **PostgreSQL Version:** 15-alpine
- **Max Connections:** 200

## IP Address Tracking

The schema includes IP address tracking in:
- `User.last_login_ip` - Last login IP address
- `UserSession.ip_address` - Session IP address
- `LoginAttempt.ip_address` - Login attempt IP address
- `TicketEvent.ip_address` - Event IP address (for audit trail)

All IP addresses use PostgreSQL `INET` type for proper IP storage.

## Quick Access Commands

```bash
# Connect via SSH and Docker
ssh root@159.198.65.38
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db

# List all databases
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "\l"

# List all tables
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db -c "\dt"

# Count records
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM tickets;"
```
