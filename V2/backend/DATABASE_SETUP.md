# Database Setup Instructions

## Database Server Information

**Zoea-2 Database:**
- Server: `172.16.40.61:5432`
- Database: `main`
- User: `admin`
- Password: `Zoea2025Secure`

**ResolveIt Database:**
- Server: `172.16.40.61:5432` (same as Zoea-2)
- Database: `resolveit` (new database to be created)
- User: `admin`
- Password: `Zoea2025Secure`

## Setup Steps

### 1. Create Database

Connect to PostgreSQL server and create the database:

```bash
# Option 1: Using psql
PGPASSWORD='Zoea2025Secure' psql -h 172.16.40.61 -U admin -d postgres -c "CREATE DATABASE resolveit;"

# Option 2: Connect interactively
psql -h 172.16.40.61 -U admin -d postgres
# Then run: CREATE DATABASE resolveit;
```

### 2. Update .env File

Ensure `.env` has:
```
DATABASE_URL=postgresql://admin:Zoea2025Secure@172.16.40.61:5432/resolveit
```

### 3. Run Migration

```bash
cd backend-v2
npm run prisma:migrate
# Or
npx prisma migrate deploy
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Verify Connection

```bash
npx prisma studio
```

## Migration Files

Migration files are located in:
- `prisma/migrations/000_init/migration.sql`

You can also apply the migration SQL directly:
```bash
psql -h 172.16.40.61 -U admin -d resolveit -f prisma/migrations/000_init/migration.sql
```

## IP Address Tracking

The schema includes IP address tracking in:
- `User.last_login_ip` - Last login IP address
- `UserSession.ip_address` - Session IP address
- `LoginAttempt.ip_address` - Login attempt IP address
- `TicketEvent.ip_address` - Event IP address (for audit trail)

All IP addresses use PostgreSQL `INET` type for proper IP storage.

