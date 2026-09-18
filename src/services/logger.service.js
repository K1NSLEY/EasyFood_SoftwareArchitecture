const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..');
const logFile = path.resolve(projectRoot, process.env.LOG_FILE || 'logs/app.log');

fs.mkdirSync(path.dirname(logFile), { recursive: true });

function writeLog(level, message, meta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  const line = JSON.stringify(payload);

  console.log(line);
  fs.appendFileSync(logFile, `${line}\n`, 'utf8');
}

module.exports = { writeLog };
