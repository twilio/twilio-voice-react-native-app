import { Request, RequestHandler, Response } from 'express';
import { jwt } from 'twilio';
import { TwilioCredentials } from '../common/types';
import { retrieveAuthentication } from '../middlewares/sample-auth';

export function createTokenRoute(
  twilioCredentials: TwilioCredentials
): RequestHandler {
  const { AccessToken, AccessToken: { VoiceGrant } } = jwt;
  return function tokenRoute(_req: Request, res: Response) {
    const authentication = retrieveAuthentication(res);

    if (typeof authentication === 'undefined') {
      res.status(403).send('Unauthenticated request.');
      return;
    }

    const accessToken = new AccessToken(
      twilioCredentials.accountSid,
      twilioCredentials.apiKeySid,
      twilioCredentials.apiKeySecret,
      {
        identity: authentication.username,
      }
    );

    const voiceGrant = new VoiceGrant({
      incomingAllow: true,
      outgoingApplicationSid: twilioCredentials.outgoingApplicationSid,
      pushCredentialSid: twilioCredentials.pushCredentialSid,
    });

    accessToken.addGrant(voiceGrant);

    res.header('Content-Type', 'text/plain')
      .status(200)
      .send(accessToken.toJwt());
  }
}
