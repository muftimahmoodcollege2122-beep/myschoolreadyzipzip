/**
 * PM2 Ecosystem — EduOS Multi-Portal SaaS
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start everything
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js         # zero-downtime reload
 *   pm2 stop all && pm2 start ...          # full restart
 *   pm2 save && pm2 startup                # persist across reboots
 *   pm2 monit                              # live dashboard
 */

const os = require('os');
const cpus = os.cpus().length;

// For each portal: use half the CPUs (min 2, max 8)
const portalInstances = Math.max(2, Math.min(8, Math.floor(cpus / 2)));
// API: use all CPUs (min 2)
const apiInstances = Math.max(2, cpus);

const commonEnv = {
  NODE_ENV: 'production',
  TZ: 'Asia/Karachi',
};

const commonEnvProd = {
  ...commonEnv,
  NODE_ENV: 'production',
};

module.exports = {
  apps: [
    // ──────────────────────────────────────────────────────────────
    //  NestJS API  (port 4000)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: apiInstances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        ...commonEnv,
        PORT: 4000,
        NODE_ENV: 'development',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 4000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
    },

    // ──────────────────────────────────────────────────────────────
    //  Marketing Website  (port 3000)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...commonEnv,
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.myschool.pk',
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },

    // ──────────────────────────────────────────────────────────────
    //  Admin Dashboard  (port 3001)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-admin',
      cwd: './apps/admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      instances: portalInstances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...commonEnv,
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'https://api.myschool.pk',
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },

    // ──────────────────────────────────────────────────────────────
    //  Teacher Portal  (port 3002)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-teacher',
      cwd: './apps/teacher',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      instances: portalInstances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...commonEnv,
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'https://api.myschool.pk',
      },
      error_file: './logs/teacher-error.log',
      out_file: './logs/teacher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },

    // ──────────────────────────────────────────────────────────────
    //  Student Portal  (port 3003)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-student',
      cwd: './apps/student',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      instances: portalInstances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...commonEnv,
        PORT: 3003,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 3003,
        NEXT_PUBLIC_API_URL: 'https://api.myschool.pk',
      },
      error_file: './logs/student-error.log',
      out_file: './logs/student-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },

    // ──────────────────────────────────────────────────────────────
    //  Parent Portal  (port 3004)
    // ──────────────────────────────────────────────────────────────
    {
      name: 'eduos-parent',
      cwd: './apps/parent',
      script: 'node_modules/.bin/next',
      args: 'start -p 3004',
      instances: portalInstances,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...commonEnv,
        PORT: 3004,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      env_production: {
        ...commonEnvProd,
        PORT: 3004,
        NEXT_PUBLIC_API_URL: 'https://api.myschool.pk',
      },
      error_file: './logs/parent-error.log',
      out_file: './logs/parent-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 3000,
    },
  ],
};
