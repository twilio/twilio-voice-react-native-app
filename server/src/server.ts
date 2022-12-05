import express, { Router } from 'express';
import type { TwilioCredentials } from './common/types';
import { createSampleAuthenticationMiddleware } from './middleware/sample-auth';
import { createTokenRoute } from './routes/token';

export function createExpressApp(twilioCredentials: TwilioCredentials) {
  const app = express();

  app.use(express.json());

  const tokenRouter = Router();
  tokenRouter.use(createSampleAuthenticationMiddleware());
  tokenRouter.post('/token', createTokenRoute(twilioCredentials));

  app.use(tokenRouter);

  return app;
}
