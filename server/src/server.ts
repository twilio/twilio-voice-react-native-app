import express, { Router } from 'express';
import type { ServerCredentials } from './common/types';
import { createTokenRoute } from './routes/token';
import { createTwimlRoute } from './routes/twiml';
import { createLogMiddleware } from './middlewares/log';
import { auth } from 'express-oauth2-jwt-bearer';

export function createExpressApp(serverConfig: ServerCredentials) {
  const app = express();

  const jwtCheck = auth({
    audience: serverConfig.AUTH0_AUDIENCE,
    issuerBaseURL: serverConfig.AUTH0_ISSUER_BASE_URL,
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(createLogMiddleware());

  const tokenRouter = Router();
  tokenRouter.use(createTokenRoute(serverConfig));
  app.post('/token', jwtCheck, tokenRouter);

  const twimlRouter = Router();
  twimlRouter.use(createTwimlRoute(serverConfig));
  app.post('/twiml', twimlRouter);

  return app;
}
