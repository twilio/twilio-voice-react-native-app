import { Request, Response } from 'express';
import { jwt } from 'twilio';
import { Platform, ServerCredentials } from '../common/types';
import { getUserInfo, verifyEmail } from '../utils/auth';
import { log } from '../utils/log';

type ParsePlatformReturnType = {
  incomingAllow: true;
  platform: Platform.Android;
  pushCredentialSid: string;
} | {
  incomingAllow: true;
  platform: Platform.Ios;
  pushCredentialSid: string;
} | {
  incomingAllow: false;
  platform: undefined;
  pushCredentialSid: undefined;
};
export function parsePlatform(
  serverCredentials: ServerCredentials,
  platform: string,
): ParsePlatformReturnType {
  switch (platform) {
    case Platform.Android:
      return {
        incomingAllow: true,
        platform: Platform.Android,
        pushCredentialSid: serverCredentials.FCM_PUSH_CREDENTIAL_SID,
      };
    case Platform.Ios:
      return {
        incomingAllow: true,
        platform: Platform.Ios,
        pushCredentialSid: serverCredentials.APN_PUSH_CREDENTIAL_SID,
      };
    default:
      return {
        incomingAllow: false,
        platform: undefined,
        pushCredentialSid: undefined,
      };
  }
}

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

    /**
     * Note: For internal use
     */
    if (
      typeof serverCredentials.EMAIL_VERIFICATION_REGEX !== 'undefined' &&
      !verifyEmail(
        userInfo.email,
        new RegExp(serverCredentials.EMAIL_VERIFICATION_REGEX),
      )
    ) {
      const msg = `Must be a valid ${serverCredentials.EMAIL_VERIFICATION_REGEX} email`;
      logMsg(msg);
      return res.header('Content-Type', 'text/plain').status(401).send(msg);
    }

    const { incomingAllow, platform, pushCredentialSid } = parsePlatform(
      serverCredentials,
      req.body.platform,
    );

    if (typeof platform === 'undefined') {
      logMsg(
        `Unknown platform detected: "${req.body.platform}". ' +
        'Supported platforms are "['android', 'ios']".`,
      );
    }

    const accessToken = new AccessToken(
      serverCredentials.ACCOUNT_SID,
      serverCredentials.API_KEY_SID,
      serverCredentials.API_KEY_SECRET,
      {
        identity: userInfo.email,
      },
    );

    const voiceGrant = new VoiceGrant({
      incomingAllow,
      outgoingApplicationSid: serverCredentials.TWIML_APP_SID,
      pushCredentialSid,
    });

    accessToken.addGrant(voiceGrant);

    res
      .header('Content-Type', 'text/plain')
      .status(200)
      .send(accessToken.toJwt());
  };
}
