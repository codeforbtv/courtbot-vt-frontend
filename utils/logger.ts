
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;
require('winston-mongodb');

const {
  LOG_COLLECTION = 'log',
  LOG_LEVEL,
  MONGODB_URI,
} = process.env;

const myFormat = printf(({ level, message, timestamp, metadata }:any) => {
  return `${timestamp} [${level}]: ${message}${metadata ? ` | ${JSON.stringify(metadata)}` : ''}`;
});

const logger = createLogger({
  level: LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    myFormat,
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      level: 'info',
      db: MONGODB_URI,
      options: {
        useUnifiedTopology: true,
      },
      collection: LOG_COLLECTION,
    }),
  ],
});

export default logger;