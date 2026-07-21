# Installation Guide

## Step 1 — Navigate to correct folder
```cmd
cd myschoolreadyzipzip\final_build\saas_build
```

## Step 2 — Install dependencies
```cmd
npm install
```

## Step 3 — Generate Prisma client (mandatory)
```cmd
npx prisma generate
```

## Step 4 — Set up environment
Copy `.env.example` to `.env` and fill in your values:
```cmd
copy .env.example .env
```

## Step 5 — Run database migrations
```cmd
npx prisma migrate deploy
```

## Step 6 — Start development
```cmd
npm run dev
```

## Common Issues

### "Could not read package.json" error
You are in the wrong folder. Always `cd final_build\saas_build` first.

### Prisma client not found
Run `npx prisma generate` after every `npm install`.

### Port already in use
Kill the process using the port:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```
