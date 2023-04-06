import { Request, RequestHandler, Response } from 'express';
import { twiml, validateExpressRequest } from 'twilio';
import { ServerCredentials } from '../common/types';
import { error } from '../utils/log';

export function createTwimlRoute(
  serverConfig: ServerCredentials,
): RequestHandler {
  const { VoiceResponse } = twiml;
  return function twimlRoute(req: Request, res: Response) {
    const requestIsValid = validateExpressRequest(
      req,
      serverConfig.AUTH_TOKEN,
      { protocol: 'https' },
    );

    if (!requestIsValid) {
      error('/twiml Unauthorized Twilio signature');
      res.status(401).send('Unauthorized Twilio signature');
      return;
    }

    const { To: to } = req.body;
    if (typeof to !== 'string') {
      error('/twiml Missing "To".');
      res.status(400).send('Missing "To".');
      return;
    }

    const recipientType = (['client', 'number'] as const).find(
      (r) => r === req.body.recipientType,
    );
    if (typeof recipientType === 'undefined') {
      error('/twiml Invalid "recipientType".');
      res.status(400).send('Invalid "recipientType".');
      return;
    }

    const callerId =
      recipientType === 'number' ? serverConfig.CALLER_ID : req.body.From;

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
