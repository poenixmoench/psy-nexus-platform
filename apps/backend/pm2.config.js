module.exports = {
  apps: [{
    name: 'psy-backend',
    script: 'dist/apps/backend/src/main.js',
    node_args: '-r module-alias/register',
    instances: 1,
    autorestart: true,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3005,
      CORS_ORIGIN: '*'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    out_file: './logs/psy-backend-out.log',
    error_file: './logs/psy-backend-error.log',
    time: true
  }]
};
