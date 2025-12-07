.PHONY: help build up down restart logs clean migrate backup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

clean: ## Stop and remove containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

migrate: ## Run database migrations
	docker-compose exec backend npx prisma migrate deploy

migrate-dev: ## Run database migrations (dev mode)
	docker-compose exec backend npx prisma migrate dev

studio: ## Open Prisma Studio
	docker-compose exec backend npx prisma studio

backup: ## Backup database
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U resolveit resolveit_db > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup created in backups/ directory"

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U resolveit -d resolveit_db

ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats resolveit-backend resolveit-frontend resolveit-postgres

