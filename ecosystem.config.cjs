// ecosystem.config.cjs
// Jalankan dengan: pm2 start ecosystem.config.cjs --env production
// Lihat status: pm2 status
// Lihat log: pm2 logs

module.exports = {
  apps: [
    {
      name: 'rbb-backend',
      script: './backend/src/index.js',
      interpreter: 'node',

      // ── Batasi RAM Node.js ──────────────────────────────────────────────
      // --max-old-space-size=200  → heap V8 max 200MB (hemat RAM di shared hosting)
      // --optimize-for-size       → V8 lebih agresif kompres objek di memori
      node_args: '--max-old-space-size=200 --optimize-for-size',

      // ── Restart otomatis jika memori melebihi 250MB ─────────────────────
      max_memory_restart: '250M',

      // ── Lingkungan production ────────────────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },

      // ── Restart policy ───────────────────────────────────────────────────
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // ── Log ──────────────────────────────────────────────────────────────
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
    {
      name: 'rbb-frontend',
      script: './.output/server/index.mjs',
      interpreter: 'node',

      // ── Batasi RAM Node.js ──────────────────────────────────────────────
      node_args: '--max-old-space-size=300 --optimize-for-size',

      // ── Restart otomatis jika memori melebihi 350MB ─────────────────────
      max_memory_restart: '350M',

      // ── Lingkungan production ────────────────────────────────────────────
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NITRO_PORT: 3000,
        HOST: '0.0.0.0',
        NITRO_HOST: '0.0.0.0',
      },

      // ── Restart policy ───────────────────────────────────────────────────
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // ── Log ──────────────────────────────────────────────────────────────
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
