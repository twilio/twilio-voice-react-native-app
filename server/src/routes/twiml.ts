import { Request, RequestHandler, Response } from 'express';
import { twiml, validateRequest } from 'twilio';
import { ServerCredentials } from '../common/types';

export function createTwimlRoute(
  serverConfig: ServerCredentials,
): RequestHandler {
  const { VoiceResponse } = twiml;
  return function twimlRoute(req: Request, res: Response) {
    const twilioSignature = req.headers['x-twilio-signature'] as string;
    const url = serverConfig.TWIML_REQUEST_URL;
    const params = req.body;
    const requestIsValid = validateRequest(
      serverConfig.AUTH_TOKEN,
      twilioSignature,
      url,
      params,
    );

    if (!requestIsValid) {
      return res.status(401).send('Unauthorized Twilio signature');
    }

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
