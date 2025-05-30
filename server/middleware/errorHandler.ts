import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  
  // Log error details for debugging (not exposed to client)
  if (statusCode >= 500) {
    logger.error(`[ERROR] ${err.stack}`);
  } else {
    logger.warn(`[WARN] ${err.message}`);
  }
  
  res.status(statusCode).json({ 
    status: 'error',
    message: message
  });
};