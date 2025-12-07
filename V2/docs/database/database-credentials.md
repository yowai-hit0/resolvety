# Database Credentials

## Production Server Database

**Server:** 159.198.65.38  
**Database Type:** PostgreSQL 15 (DevLabs Container)

### Connection Details

#### From Host Machine (External Access)
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

#### From Docker Containers (Internal Network)
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

### DevLabs PostgreSQL Admin (Default Database)
```
Host: 159.198.65.38 (external) or devslab-postgres (internal)
Port: 5433 (external) or 5432 (internal)
Database: postgres
Username: devslab_admin
Password: devslab_secure_password_2024
```

## Connection Methods

### Using psql (Command Line)
```bash
# From host machine
psql -h 159.198.65.38 -p 5433 -U devslab_admin -d resolveit_db

# From Docker container
docker exec -it devslab-postgres psql -U devslab_admin -d resolveit_db
```

### Using pgAdmin or DBeaver
- **Host:** 159.198.65.38
- **Port:** 5433
- **Database:** resolveit_db
- **Username:** devslab_admin
- **Password:** devslab_secure_password_2024

### Using Connection String
```bash
# Environment variable
export DATABASE_URL="postgresql://devslab_admin:devslab_secure_password_2024@159.198.65.38:5433/resolveit_db"

# Or in .env file
DATABASE_URL=postgresql://devslab_admin:devslab_secure_password_2024@devslab-postgres:5432/resolveit_db
```

## Database Information

- **Container Name:** `devslab-postgres`
- **Network:** `devslab-network`
- **Volume:** `devslab_postgres_data`
- **PostgreSQL Version:** 15.14

## Security Notes

⚠️ **IMPORTANT:**
- These are production credentials
- Change default passwords in production
- Use strong, unique passwords
- Restrict database access to necessary IPs only
- Consider using SSL/TLS for connections
- Regularly rotate passwords

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

