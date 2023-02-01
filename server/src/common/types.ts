import { EnvVars } from '../utils/env';

export interface TwilioCredentials {
  readonly [EnvVars.AccountSid]: string;
  readonly [EnvVars.ApiKeySid]: string;
  readonly [EnvVars.ApiKeySecret]: string;
  readonly [EnvVars.OutgoingApplicationSid]: string;
  readonly [EnvVars.CallerId]: string;
  readonly [EnvVars.PushCredentialSid]: string;
}
