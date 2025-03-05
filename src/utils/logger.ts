import winston from 'winston';

// Define os formatos de log
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Configuração do logger
const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(), 
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Salva erros no arquivo
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }) // Salva logs de info
  ],
});

// Se estiver em ambiente de produção, não exibir logs no console
if (process.env.NODE_ENV === 'production') {
  logger.remove(new winston.transports.Console());
}

export default logger;
