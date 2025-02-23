// Logger.ts

import pino from 'pino';

const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname'
    }
});

export default logger;
