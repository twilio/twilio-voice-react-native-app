import { Request, RequestHandler, Response } from 'express';
import { twiml } from 'twilio';
import { TwilioCredentials } from '../common/types';
import { retrieveAuthentication } from '../middlewares/sample-auth';

export function createTwimlRoute(
  twilioCredentials: TwilioCredentials
): RequestHandler {
  const { VoiceResponse } = twiml;
  return function twimlRoute(req: Request, res: Response) {
    const authentication = retrieveAuthentication(res);

    if (typeof authentication === 'undefined') {
      res.status(403).send('Unauthenticated request.');
      return;
    }

    const { to } = req.body;

    if (typeof to !== 'string') {
      res.status(401).send('Missing "to".');
      return;
    }

    const twimlResponse = new VoiceResponse();

    twimlResponse.dial().client(to);

    res.header('Content-Type', 'text/xml')
      .status(200)
      .send(twimlResponse.toString());
  }
}
