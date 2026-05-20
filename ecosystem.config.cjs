/**
 * PM2 — BEA E-Learning (VPS)
 *
 * Isticmaal:
 *   cd /path/to/BEA-E-learning-Project
 *   pm2 start ecosystem.config.cjs
 *
 * Ka hor: backend/.env iyo frontend/.env.production (NEXT_PUBLIC_API_URL) + npm run build labada.
 */
module.exports = {
  apps: [
    {
      name: "bea-backend",
      cwd: "./backend",
      script: "server.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "7004",
      },
    },
    {
      name: "bea-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      interpreter: "none",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "768M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
