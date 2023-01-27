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
      res.status(400).send('Missing "to".');
      return;
    }

    const recipientType = (['client', 'number'] as const).find(
      (r) => r === req.body.recipientType,
    );
    if (typeof recipientType === 'undefined') {
      res.status(400).send('Recipient type invalid.');
      return;
    }

    const callerId = recipientType === 'number'
      ? twilioCredentials.CALLER_ID
      : req.body.From;

    const twimlResponse = new VoiceResponse();
    const dial = twimlResponse.dial({
      answerOnBridge: true,
      callerId,
    });
    dial[recipientType](to);

    res.header('Content-Type', 'text/xml')
      .status(200)
      .send(twimlResponse.toString());
  }
}
