import { Request, Response, NextFunction } from 'express';
import LogRepository from '../repositories/LogRepository';

/**
 * Extract IP address from request
 */
function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  }
  return req.socket.remoteAddress || null;
}

/**
 * Extract user agent (terminal) from request
 */
function getUserAgent(req: Request): string | null {
  return req.headers['user-agent'] || null;
}

/**
 * Middleware to log critical operations automatically
 */
export const loggingMiddleware = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const usuario_id = user ? user.id : null;
      const ip = getClientIp(req);
      const terminal = getUserAgent(req);

      // Log the action
      await LogRepository.log({
        usuario_id,
        accion: action,
        ip,
        terminal,
      });

      next();
    } catch (error) {
      console.error('❌ Logging middleware error:', error);
      // Don't block the request if logging fails
      next();
    }
  };
};

/**
 * Log action manually (for use in services/controllers)
 */
export async function logAction(
  accion: string,
  usuario_id?: number | null,
  req?: Request
): Promise<void> {
  try {
    const ip = req ? getClientIp(req) : null;
    const terminal = req ? getUserAgent(req) : null;

    await LogRepository.log({
      usuario_id,
      accion,
      ip,
      terminal,
    });
  } catch (error) {
    console.error('❌ Failed to log action:', error);
  }
}

/**
 * Log levels for winston
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log to console with level
 */
export function log(level: LogLevel, message: string, meta?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case LogLevel.ERROR:
      console.error(logMessage, meta || '');
      break;
    case LogLevel.WARN:
      console.warn(logMessage, meta || '');
      break;
    case LogLevel.INFO:
      console.info(logMessage, meta || '');
      break;
    case LogLevel.DEBUG:
      console.debug(logMessage, meta || '');
      break;
  }
}
