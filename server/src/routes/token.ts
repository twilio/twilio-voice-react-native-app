import { Request, Response } from 'express';
import { jwt } from 'twilio';
import { Platform, ServerConfig } from '../common/types';
import { getUserInfo, verifyEmail } from '../utils/auth';
import { log } from '../utils/log';

type ParsePlatformReturnType = {
  incomingAllow: true;
  platform: Platform.Android;
  pushCredentialSid?: string;
} | {
  incomingAllow: true;
  platform: Platform.Ios;
  pushCredentialSid?: string;
} | {
  incomingAllow: false;
  platform: undefined;
  pushCredentialSid: undefined;
};
export function parsePlatform(
  serverConfig: ServerConfig,
  platform: string,
): ParsePlatformReturnType {
  switch (platform) {
    case Platform.Android:
      return {
        incomingAllow: true,
        platform: Platform.Android,
        pushCredentialSid: serverConfig.FCM_PUSH_CREDENTIAL_SID,
      };
    case Platform.Ios:
      return {
        incomingAllow: true,
        platform: Platform.Ios,
        pushCredentialSid: serverConfig.APN_PUSH_CREDENTIAL_SID,
      };
    default:
      return {
        incomingAllow: false,
        platform: undefined,
        pushCredentialSid: undefined,
      };
  }
}

export function createTokenRoute(serverConfig: ServerConfig) {
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
      serverConfig.AUTH0_ISSUER_BASE_URL,
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
      typeof serverConfig.EMAIL_VERIFICATION_REGEX !== 'undefined' &&
      !verifyEmail(
        userInfo.email,
        new RegExp(serverConfig.EMAIL_VERIFICATION_REGEX),
      )
    ) {
      const msg = `Must be a valid ${serverConfig.EMAIL_VERIFICATION_REGEX} email`;
      logMsg(msg);
      return res.header('Content-Type', 'text/plain').status(401).send(msg);
    }

    const { incomingAllow, platform, pushCredentialSid } = parsePlatform(
      serverConfig,
      req.body.platform,
    );

    if (typeof platform === 'undefined') {
      logMsg(
        `Unknown platform detected: "${req.body.platform}". ' +
        'Supported platforms are "['android', 'ios']".`,
      );
    }

    const accessToken = new AccessToken(
      serverConfig.ACCOUNT_SID,
      serverConfig.API_KEY_SID,
      serverConfig.API_KEY_SECRET,
      {
        /**
         * The `CLIENT_IDENTITY` environment variable used to override the
         * identity here is used for e2e testing.
         *
         * See the file `e2e-testing.md` for more information.
         */
        identity: serverConfig.CLIENT_IDENTITY ?? userInfo.email,
      },
    );

    const voiceGrant = new VoiceGrant({
      incomingAllow,
      outgoingApplicationSid: serverConfig.TWIML_APP_SID,
      pushCredentialSid,
    });

    accessToken.addGrant(voiceGrant);

    res
      .header('Content-Type', 'text/plain')
      .status(200)
      .send(accessToken.toJwt());
  };
}
