import { Request, Response, NextFunction, RequestHandler } from 'express';

function logMiddleware(req: Request, res: Response, next: NextFunction): void {
  console.log(Date().toLocaleString(), req.method, req.originalUrl);

  next();
}

export function createLogMiddleware(): RequestHandler {
  return logMiddleware;
}
