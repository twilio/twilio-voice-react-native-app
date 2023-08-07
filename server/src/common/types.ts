import { EnvVars } from '../utils/env';

export interface TwilioCredentials {
  readonly [EnvVars.AccountSid]: string;
  readonly [EnvVars.ApnPushCredentialSid]?: string;
  readonly [EnvVars.ApiKeySid]: string;
  readonly [EnvVars.ApiKeySecret]: string;
  readonly [EnvVars.AuthToken]: string;
  readonly [EnvVars.CallerId]: string;
  readonly [EnvVars.FcmPushCredentialSid]?: string;
  readonly [EnvVars.OutgoingApplicationSid]: string;
}

export interface Auth0Credentials {
  readonly [EnvVars.Auth0Audience]: string;
  readonly [EnvVars.Auth0IssuerBaseUrl]: string;
}

export interface Flags {
  readonly [EnvVars.ClientIdentity]?: string;
  readonly [EnvVars.EmailVerificationRegex]?: string;
}

export type ServerConfig = TwilioCredentials & Auth0Credentials & Flags;

export enum Platform {
  Android = 'android',
  Ios = 'ios',
}
