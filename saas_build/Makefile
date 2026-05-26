.PHONY: dev install db-up db-migrate db-seed clean

install:
	npm install

db-up:
	docker-compose up -d postgres redis

db-migrate:
	cd packages/database && npx prisma migrate deploy

db-generate:
	cd packages/database && npx prisma generate

db-seed:
	cd packages/database && npx prisma db seed

dev:
	npm run dev

build:
	npm run build

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/*/.next apps/*/dist

setup: install db-up
	sleep 3
	$(MAKE) db-migrate
	$(MAKE) db-generate
	@echo "\n✅ Setup complete. Run: make dev\n"
