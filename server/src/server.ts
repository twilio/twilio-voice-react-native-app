import express, { Router } from 'express';
import type { TwilioCredentials } from './common/types';
import { createTokenRoute } from './routes/token';
import { createTwimlRoute } from './routes/twiml';
import { createLogMiddleware } from './middlewares/log';
import { auth } from 'express-oauth2-jwt-bearer';
import config from '../config';

export function createExpressApp(twilioCredentials: TwilioCredentials) {
  const app = express();

  const jwtCheck = auth({
    audience: config.audience,
    issuerBaseURL: config.issuerBaseURL,
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(createLogMiddleware());

  const tokenRouter = Router();
  tokenRouter.use(createTokenRoute(twilioCredentials));
  app.post('/token', jwtCheck, tokenRouter);

  const twimlRouter = Router();
  twimlRouter.use(createTwimlRoute(twilioCredentials));
  app.post('/twiml', twimlRouter);

  return app;
}
