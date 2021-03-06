module.exports = {
  apps: [{
    name: 'smad',
    script: './server/build/bin/www.js',
    watch: ['./server/src'],
    ignore_watch: ['./node_modules', './logs'],
    max_memory_restart: '200M',
    wait_ready: true,
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
