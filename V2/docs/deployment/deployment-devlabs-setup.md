# DevLabs PostgreSQL Setup Guide

This guide explains how to set up the shared DevLabs PostgreSQL container that will host multiple databases, including ResolveIt.

## Quick Start

### 1. Start DevLabs PostgreSQL Container

```bash
# Using the devlabs docker-compose file
docker-compose -f docker-compose.devlabs-db.yml --env-file .env.devlabs up -d

# Or set environment variables and run
export POSTGRES_USER=devslab_admin
export POSTGRES_PASSWORD=devslab_secure_password_2024
export POSTGRES_PORT=5433
docker-compose -f docker-compose.devlabs-db.yml up -d
```

### 2. Create ResolveIt Database

```bash
# Connect to PostgreSQL
docker exec -it devslab-postgres psql -U devslab_admin -d postgres

# Create ResolveIt database
CREATE DATABASE resolveit_db;

# Create a dedicated user for ResolveIt (optional but recommended)
CREATE USER resolveit_user WITH PASSWORD 'resolveit_secure_password';
GRANT ALL PRIVILEGES ON DATABASE resolveit_db TO resolveit_user;

# Exit
\q
```

### 3. Start ResolveIt Application

```bash
# Make sure DevLabs PostgreSQL is running first
docker-compose -f docker-compose.devlabs-db.yml ps

# Start ResolveIt (it will connect to devslab-postgres)
docker-compose -f docker-compose.resolveit.yml --env-file .env.devlabs up -d --build
```

## Default Credentials

**DevLabs PostgreSQL Admin:**
- Host: `localhost` (or `devslab-postgres` from within Docker network)
- Port: `5433`
- Username: `devslab_admin`
- Password: `devslab_secure_password_2024`
- Default Database: `postgres`

**⚠️ IMPORTANT:** Change the default password in production!

## Managing Databases

### List All Databases

```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "\l"
```

### Create a New Database

```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE DATABASE your_database_name;"
```

### Create a New User for a Database

```bash
# Create user
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE USER your_user WITH PASSWORD 'your_password';"

# Grant privileges
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;"
```

### Access a Database

```bash
# Using admin user
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db

# Using specific user
docker exec -it devslab-postgres psql -U resolveit_user -d resolveit_db
```

### Backup a Database

```bash
# Backup ResolveIt database
docker exec devslab-postgres pg_dump -U devslab_admin resolveit_db > backup_resolveit_$(date +%Y%m%d).sql

# Backup all databases
docker exec devslab-postgres pg_dumpall -U devslab_admin > backup_all_$(date +%Y%m%d).sql
```

### Restore a Database

```bash
# Restore from backup
docker exec -i devslab-postgres psql -U devslab_admin -d resolveit_db < backup_resolveit_20241206.sql
```

## Connection Strings

### From Host Machine

```
postgresql://devslab_admin:devslab_secure_password_2024@localhost:5433/database_name
```

### From Docker Containers (same network)

```
postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/database_name
```

Note: Port is `5432` from within Docker network, `5433` from host.

## ResolveIt Configuration

Update your ResolveIt `.env` file:

```bash
# Use shared DevLabs PostgreSQL
DATABASE_URL=postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db

# Or use dedicated ResolveIt user
DATABASE_URL=postgresql://resolveit_user:resolveit_secure_password@devslab-postgres:5432/resolveit_db
```

## Adding More Projects

To add another project database:

1. Create the database:
   ```bash
   docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE DATABASE new_project_db;"
   ```

2. Create a user (optional):
   ```bash
   docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "CREATE USER new_project_user WITH PASSWORD 'secure_password';"
   docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE new_project_db TO new_project_user;"
   ```

3. Use the connection string in your project's configuration.

## Monitoring

### Check Container Status

```bash
docker ps | grep devslab-postgres
docker logs devslab-postgres
```

### Check Database Size

```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "
SELECT 
    datname,
    pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;
"
```

### Check Active Connections

```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "
SELECT 
    datname,
    count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs devslab-postgres

# Check if port is already in use
netstat -tulpn | grep 5433
```

### Can't Connect to Database

1. Verify container is running: `docker ps | grep devslab-postgres`
2. Check network: `docker network inspect devslab-network`
3. Test connection: `docker exec -it devslab-postgres psql -U devslab_admin -d postgres`

### Permission Denied

Make sure you're using the correct username and password. Reset if needed:
```bash
docker exec -it devslab-postgres psql -U devslab_admin -d postgres -c "ALTER USER your_user WITH PASSWORD 'new_password';"
```

## Security Notes

1. **Change default passwords** in production
2. **Use dedicated users** for each project (don't share admin credentials)
3. **Limit network access** - PostgreSQL is only accessible from Docker network and localhost
4. **Regular backups** - Set up automated backups
5. **Monitor connections** - Keep an eye on active connections and database sizes

