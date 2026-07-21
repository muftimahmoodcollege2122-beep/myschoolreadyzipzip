# MySchool App — Multi-Tenant School Management SaaS

## Quick Start

```bash
# 1. Install
npm install

# 2. Start DB + Redis (Docker)
make db-up

# 3. Run migrations
make db-migrate && make db-generate

# 4. Start dev servers
npm run dev
```

**API:** http://localhost:3001/api/docs  
**Web:** http://localhost:3000  
**School Website:** http://localhost:3000/s/your-school-slug

## Environment

Copy `.env.example` to `.env` in `apps/api/` and fill in values.

## Architecture

- **Backend:** NestJS + TypeScript + PostgreSQL + Redis + Kafka
- **Frontend:** Next.js 14 + TailwindCSS + TanStack Query
- **Multi-tenant:** Schema-per-tenant with RLS
- **Real-time:** Socket.io + Redis adapter
- **Theming:** 20 unique school website themes

## School Website Themes

Each school auto-gets a unique theme based on their slug:
- 5 layout templates (Classic, Modern, Bold, Elegant, Vibrant)
- 20 color palettes
- 10+ font pairings
- Customizable via admin Settings → Theme

## URLs

| URL | Description |
|-----|-------------|
| `/s/:slug` | School public website |
| `/s/:slug/admin` | School admin panel |
| `/s/:slug/teacher` | Teacher portal |
| `/s/:slug/portal` | Student portal |
| `/s/:slug/parent` | Parent portal |
