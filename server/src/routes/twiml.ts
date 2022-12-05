import { twiml } from 'twilio';
import { Request, RequestHandler, Response } from 'express';
import { retrieveAuthentication } from '../middleware/sample-auth';
import { TwilioCredentials } from '../common/types';

export function createTwimlRoute(
  twilioCredentials: TwilioCredentials
): RequestHandler {
  return function twimlRoute(req: Request, res: Response) {
    const authentication = retrieveAuthentication(res);

    if (typeof authentication === 'undefined') {
      res.status(403).send('Unauthenticated request.');
      return;
    }

    const { to } = req.body;

    if (typeof to !== 'string') {
      res.status(401).send();
      return;
    }

    const twimlResponse = new twiml.VoiceResponse();

    twimlResponse.dial().client(to);

    res.header('Content-Type', 'text/xml')
      .status(200)
      .send(twimlResponse.toString());
  }
}
