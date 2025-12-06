module.exports = {
  apps: [
    {
      name: 'psy-nexus-backend',
      script: 'npm',
      args: 'run dev:pm2',
      cwd: './apps/backend',
      watch: true,
      ignore_watch: ['node_modules'],
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'psy-nexus-frontend',
      script: 'npm',
      args: 'run dev:pm2',
      cwd: './apps/frontend',
      watch: true,
      ignore_watch: ['node_modules'],
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: 'development',
      },
    }
  ],
};
