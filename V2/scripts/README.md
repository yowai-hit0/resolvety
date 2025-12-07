# ResolveIt V2 Scripts

This directory contains all scripts for the ResolveIt V2 project.

## 📁 Directory Structure

### `/deployment/` - Deployment Scripts
- **deploy-to-server.sh** - Complete deployment script to production server
- **setup-devlabs.sh** - DevLabs PostgreSQL setup script

### `/migration/` - Migration Scripts (Historical)
⚠️ **Note:** Migration is complete. These scripts are kept for historical reference only.

The application now uses **only one database** on the production server (159.198.65.38).

- **migrate-data.ts** - TypeScript script to migrate data (migration complete)
- **migrate-from-old-server.sh** - Complete migration script (no longer needed)
- **export-from-old-server.sh** - Export script (no longer needed)
- **import-to-new-server.sh** - Import script (no longer needed)
- **migration-guide.md** - Migration guide documentation (in `../docs/migration/`)

### Root Scripts
- **Makefile** - Docker Compose convenience commands
- **test-all-public-apis.sh** - Test all public API endpoints
- **test-api.sh** - Basic API testing script
- **test-apis.sh** - API testing script
- **test-public-api.sh** - Public API testing script

## 🚀 Usage

### Deployment
```bash
# Deploy to production server
./scripts/deployment/deploy-to-server.sh

# Setup DevLabs PostgreSQL
./scripts/deployment/setup-devlabs.sh
```

### Migration
⚠️ **Migration is complete.** The application now uses only one database on the production server (159.198.65.38).

Migration scripts are kept for historical reference only. See [docs/migration/migration-guide.md](../docs/migration/migration-guide.md) for details.

### Testing
```bash
# Test all APIs
./scripts/test-all-public-apis.sh

# Test specific API
./scripts/test-api.sh
```

### Docker Commands (Makefile)
```bash
# Build containers
make build

# Start services
make up

# View logs
make logs

# Run migrations
make migrate
```

## 📝 Notes

- All scripts should be executable (`chmod +x`)
- Scripts use environment variables from `.env.devlabs`
- Test scripts require the backend to be running

