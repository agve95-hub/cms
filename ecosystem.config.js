module.exports = {
  apps: [{
    name: 'cms',
    cwd: __dirname,
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    watch: false,
  }],
};
