import { Request, RequestHandler, Response } from 'express';
import { twiml } from 'twilio';
import { TwilioCredentials } from '../common/types';

export function createTwimlRoute(
  twilioCredentials: TwilioCredentials,
): RequestHandler {
  const { VoiceResponse } = twiml;
  return function twimlRoute(req: Request, res: Response) {
    const { To: to } = req.body;
    if (typeof to !== 'string') {
      res.status(400).send('Missing "To".');
      return;
    }

    const recipientType = (['client', 'number'] as const).find(
      (r) => r === req.body.recipientType,
    );
    if (typeof recipientType === 'undefined') {
      res.status(400).send('Invalid "recipientType".');
      return;
    }

    const callerId =
      recipientType === 'number' ? twilioCredentials.CALLER_ID : req.body.From;

    const twimlResponse = new VoiceResponse();
    const dial = twimlResponse.dial({
      answerOnBridge: true,
      callerId,
    });
    dial[recipientType](to);

    res
      .header('Content-Type', 'text/xml')
      .status(200)
      .send(twimlResponse.toString());
  };
}
