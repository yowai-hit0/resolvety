# ResolveIt V2

Complete ticket management system with role-based access control for admins, agents, and customers.

## 🚀 Quick Start

### Deploy to Production
```bash
./scripts/deployment/deploy-to-server.sh
```

### Local Development
```bash
# Start services
cd scripts && make up

# Or use docker compose directly
docker compose -f docker-compose.resolveit.yml up -d
```

## 📚 Documentation

All documentation is in the [`/docs/`](./docs/) folder:

- **[Project Overview](./docs/project-overview.md)** - Complete project documentation
- **[Deployment Guides](./docs/deployment/)** - Deployment instructions
- **[API Documentation](./docs/api/)** - API reference and testing
- **[Database Docs](./docs/database/)** - Database setup and schema
- **[Migration Guides](./docs/migration/)** - Data migration documentation

## 📁 Project Structure

```
v2/
├── backend/          # NestJS Backend API
├── ui/              # Next.js Frontend
├── docs/            # All documentation
├── scripts/         # Utility scripts
└── docker-compose.*.yml  # Docker configurations
```

## 🔗 Access URLs (Production)

- **Frontend**: http://159.198.65.38:3001
- **Backend API**: http://159.198.65.38:3000/api
- **API Docs**: http://159.198.65.38:3000/api/docs

## 📝 Environment Setup

See [.env.example](./.env.example) for required environment variables.

## 🛠️ Scripts

- **Deployment**: `scripts/deployment/`
- **Migration**: `scripts/migration/`
- **Testing**: `scripts/test-*.sh`

See [scripts/README.md](./scripts/README.md) for details.

## 📖 Full Documentation

👉 **[View Complete Documentation](./docs/README.md)**

