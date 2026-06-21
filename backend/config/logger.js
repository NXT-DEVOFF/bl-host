const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const colors = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[35m',
  RESET: '\x1b[0m',
};

class Logger {
  constructor(level = process.env.LOG_LEVEL || 'info') {
    this.level = levels[level.toUpperCase()] || levels.INFO;
  }

  log(levelName, message, data = {}) {
    const levelValue = levels[levelName];
    if (levelValue > this.level) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${levelName}: ${message}`;
    const fullMessage = Object.keys(data).length > 0 
      ? `${logMessage} ${JSON.stringify(data)}` 
      : logMessage;

    if (process.env.NODE_ENV !== 'production') {
      const color = colors[levelName] || '';
      console.log(`${color}${fullMessage}${colors.RESET}`);
    }

    if (levelName === 'ERROR' || levelName === 'WARN') {
      const filename = path.join(logsDir, `${levelName.toLowerCase()}.log`);
      fs.appendFileSync(filename, `${fullMessage}\n`);
    }
  }

  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
}

module.exports = new Logger();
