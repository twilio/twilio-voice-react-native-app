import express, { Router } from 'express';
import type { TwilioCredentials } from './common/types';
import { createSampleAuthenticationMiddleware } from './middlewares/sample-auth';
import { createTokenRoute } from './routes/token';
import { createTwimlRoute } from './routes/twiml';

export function createExpressApp(twilioCredentials: TwilioCredentials) {
  const app = express();

  app.use(express.json());

  const authMiddleware = createSampleAuthenticationMiddleware();

  const tokenRouter = Router();
  tokenRouter.use(authMiddleware);
  tokenRouter.use(createTokenRoute(twilioCredentials));
  app.post('/token', tokenRouter);

  const twimlRouter = Router();
  twimlRouter.use(authMiddleware);
  twimlRouter.use(createTwimlRoute(twilioCredentials));
  app.post('/twiml', twimlRouter);

  return app;
}
