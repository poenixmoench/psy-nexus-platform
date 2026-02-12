module.exports = {
  apps: [{
    name: 'psy-backend',
    script: 'dist/apps/backend/src/index.js',
    cwd: '/root/psy-nexus-platform/apps/backend',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    min_uptime: '5000',
    max_restarts: 10,
    restart_delay: 2000,
    max_memory_restart: '750M',
    env_file: '.env',
    node_args: '-r module-alias/register',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      AGENT_TIMEOUT: '30000'
    },
    error_file: '/root/.pm2/logs/psy-backend-error.log',
    out_file: '/root/.pm2/logs/psy-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
