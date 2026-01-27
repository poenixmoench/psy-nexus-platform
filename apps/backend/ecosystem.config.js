module.exports = {
  apps: [
    {
      name: 'psy-backend-core',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/core-err.log',
      out_file: './logs/core-out.log',
      log_file: './logs/core-combined.log'
    },
    {
      name: 'psy-socket-gateway',
      script: './dist/socket-server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/socket-err.log',
      out_file: './logs/socket-out.log',
      log_file: './logs/socket-combined.log'
    }
  ]
};
