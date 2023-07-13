import { EnvVars } from '../utils/env';

export interface TwilioCredentials {
  readonly [EnvVars.AccountSid]: string;
  readonly [EnvVars.AuthToken]: string;
  readonly [EnvVars.ApiKeySid]: string;
  readonly [EnvVars.ApiKeySecret]: string;
  readonly [EnvVars.OutgoingApplicationSid]: string;
  readonly [EnvVars.CallerId]: string;
  readonly [EnvVars.PushCredentialSid]: string;
}

export interface Auth0Credentials {
  readonly [EnvVars.Auth0Audience]: string;
  readonly [EnvVars.Auth0IssuerBaseUrl]: string;
}

export interface Flags {
  readonly [EnvVars.EmailVerificationRegex]?: string;
}

export interface ServerCredentials
  extends TwilioCredentials,
    Auth0Credentials,
    Flags {}
