import { Request, Response } from 'express';
import { jwt } from 'twilio';
import { ServerCredentials } from '../common/types';
import { getUserInfo } from '../utils/auth';
import { log } from '../utils/log';

export function createTokenRoute(serverCredentials: ServerCredentials) {
  const {
    AccessToken,
    AccessToken: { VoiceGrant },
  } = jwt;

  const logMsg = (msg: string) => {
    log(`/token ${msg}`);
  };

  return async function tokenRoute(req: Request, res: Response) {
    if (typeof req.auth?.token !== 'string') {
      const msg = 'No auth token.';
      logMsg(msg);
      return res.header('Content-Type', 'text/plain').status(403).send(msg);
    }

    const userInfoResult = await getUserInfo(
      serverCredentials.AUTH0_ISSUER_BASE_URL,
      req.auth.token,
    );
    if (!userInfoResult.success) {
      const msg = 'User info not found.';
      logMsg(msg);
      return res.header('Content-Type', 'text/plain').status(404).send(msg);
    }

    const { userInfo } = userInfoResult;
    const accessToken = new AccessToken(
      serverCredentials.ACCOUNT_SID,
      serverCredentials.API_KEY_SID,
      serverCredentials.API_KEY_SECRET,
      {
        identity: userInfo.email,
      },
    );

    const voiceGrant = new VoiceGrant({
      incomingAllow: true,
      outgoingApplicationSid: serverCredentials.TWIML_APP_SID,
      pushCredentialSid: serverCredentials.PUSH_CREDENTIAL_SID,
    });

    accessToken.addGrant(voiceGrant);

    res
      .header('Content-Type', 'text/plain')
      .status(200)
      .send(accessToken.toJwt());
  };
}
