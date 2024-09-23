const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  fs.appendFile(path.join(__dirname, '../logs/api.log'), logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file', err);
    }
  });
  next();
};