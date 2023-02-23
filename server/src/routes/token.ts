import { Request, RequestHandler, Response } from 'express';
import { jwt } from 'twilio';
import { TwilioCredentials } from '../common/types';

export function createTokenRoute(
  twilioCredentials: TwilioCredentials,
): RequestHandler {
  const {
    AccessToken,
    AccessToken: { VoiceGrant },
  } = jwt;
  return function tokenRoute(_req: Request, res: Response) {
    const accessToken = new AccessToken(
      twilioCredentials.ACCOUNT_SID,
      twilioCredentials.API_KEY_SID,
      twilioCredentials.API_KEY_SECRET,
    );

    const voiceGrant = new VoiceGrant({
      incomingAllow: true,
      outgoingApplicationSid: twilioCredentials.OUTGOING_APPLICATION_SID,
      pushCredentialSid: twilioCredentials.PUSH_CREDENTIAL_SID,
    });

    accessToken.addGrant(voiceGrant);

    res
      .header('Content-Type', 'text/plain')
      .status(200)
      .send(accessToken.toJwt());
  };
}
