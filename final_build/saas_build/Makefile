.PHONY: install dev build start lint type-check clean \
        db-up db-down db-migrate db-seed db-generate db-reset db-studio \
        docker-build docker-up docker-down docker-restart docker-logs docker-ps \
        setup setup-prod deploy

# ── Local Dev ─────────────────────────────────────────────────────────────

install:
	npm install

dev: install
	npm run dev

build:
	npm run build

lint:
	npm run lint

type-check:
	npm run type-check

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules \
	       apps/*/.next apps/*/dist apps/api/dist

# ── Database ──────────────────────────────────────────────────────────────

db-up:
	docker-compose up -d postgres redis
	@echo "Waiting for Postgres to be ready..."; sleep 4

db-down:
	docker-compose stop postgres redis

db-generate:
	cd packages/database && npx prisma generate

db-migrate:
	cd packages/database && npx prisma migrate deploy

db-seed:
	cd packages/database && npx prisma db seed

db-reset:
	cd packages/database && npx prisma migrate reset --force

db-studio:
	cd packages/database && npx prisma studio

# ── Docker (full production stack) ───────────────────────────────────────

docker-build:
	docker-compose build --parallel

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-restart:
	docker-compose down && docker-compose up -d

docker-logs:
	docker-compose logs -f

docker-ps:
	docker-compose ps

# ── Convenience Setup ─────────────────────────────────────────────────────

## First-time local development setup
setup: install db-up
	sleep 4
	$(MAKE) db-generate
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo ""
	@echo "EduOS is ready! Run: make dev"
	@echo ""

## Production Docker stack (requires .env)
setup-prod:
	@test -f .env || (echo ".env file missing — copy .env.example to .env and fill in values"; exit 1)
	$(MAKE) docker-build
	$(MAKE) docker-up
	@echo ""
	@echo "EduOS production stack is running:"
	@echo "  API:     http://localhost:4000"
	@echo "  Web:     http://localhost:3000"
	@echo "  Admin:   http://localhost:3001"
	@echo "  Teacher: http://localhost:3002"
	@echo "  Student: http://localhost:3003"
	@echo "  Parent:  http://localhost:3004"
	@echo ""

## Run the deployment shell script
deploy:
	bash deploy.sh
