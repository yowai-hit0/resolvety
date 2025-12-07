# ResolveIt V2

Complete ticket management system with role-based access control for admins, agents, and customers.

## 📁 Project Structure

```
V2/
├── backend/          # NestJS Backend API
├── ui/              # Next.js Frontend
├── docs/            # Documentation
│   ├── deployment/  # Deployment guides
│   ├── api/        # API documentation
│   ├── database/   # Database documentation
│   └── migration/  # Migration guides
├── scripts/        # Utility scripts
│   ├── deployment/ # Deployment scripts
│   ├── migration/  # Migration scripts
│   └── *.sh        # Test scripts
└── docker-compose.*.yml  # Docker configurations
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Deployment
```bash
# Deploy to production server
./scripts/deployment/deploy-to-server.sh
```

See [docs/deployment/deployment-quick-start.md](./docs/deployment/deployment-quick-start.md) for detailed instructions.

## 📚 Documentation

All documentation is organized in the `/docs/` folder:

- **Deployment**: [docs/deployment/](./docs/deployment/)
- **API**: [docs/api/](./docs/api/)
- **Database**: [docs/database/](./docs/database/)
- **Migration**: [docs/migration/](./docs/migration/)

## 🛠️ Scripts

All scripts are in the `/scripts/` folder:

- **Deployment**: `scripts/deployment/`
- **Migration**: `scripts/migration/`
- **Testing**: `scripts/test-*.sh`

See [scripts/README.md](./scripts/README.md) for details.

## 🐳 Docker Commands

```bash
# Using Makefile
make build      # Build containers
make up         # Start services
make logs       # View logs
make migrate    # Run migrations

# Or using docker compose directly
docker compose -f docker-compose.resolveit.yml up -d
```

## 🔗 Access URLs

- **Frontend**: http://159.198.65.38:3001
- **Backend API**: http://159.198.65.38:3000/api
- **API Docs**: http://159.198.65.38:3000/api/docs

## 📝 Environment Variables

See [.env.example](./.env.example) for all required environment variables.

## 🔒 Security

- Never commit `.env` files
- Use strong passwords in production
- Rotate JWT secrets regularly

## 📖 More Information

- [Complete Documentation](./docs/README.md)
- [Deployment Guide](./docs/deployment/deployment-guide.md)
- [API Documentation](./docs/api/api-status.md)

