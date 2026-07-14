/**
 * PM2 process definition for JustX CMS.
 *
 * Usage (on the VPS, after `npm run build`):
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup            # follow the printed instructions once, so PM2
 *                           # restarts the app on server reboot
 *
 * Assumes `output: "standalone"` in next.config.ts, so the runnable server
 * lives at .next/standalone/server.js and needs its own copy of the public/
 * and .next/static/ assets alongside it (see deploy.sh, which handles this).
 */
module.exports = {
  apps: [
    {
      name: "justx-cms",
      cwd: "./.next/standalone",
      script: "server.js",
      instances: 1, // single instance: matches the 1 vCPU / 4GB target and the
      // in-memory rate limiter, which assumes one process
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "800M",
      autorestart: true,
      watch: false,
      merge_logs: true,
      out_file: "../../logs/pm2-out.log",
      error_file: "../../logs/pm2-error.log",
    },
  ],
};
