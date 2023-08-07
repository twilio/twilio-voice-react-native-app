import * as dotenv from 'dotenv';
import type { ServerConfig } from '../common/types';

dotenv.config();

export enum EnvVars {
  AccountSid = 'ACCOUNT_SID',
  ApiKeySecret = 'API_KEY_SECRET',
  ApiKeySid = 'API_KEY_SID',
  ApnPushCredentialSid = 'APN_PUSH_CREDENTIAL_SID',
  Auth0Audience = 'AUTH0_AUDIENCE',
  Auth0IssuerBaseUrl = 'AUTH0_ISSUER_BASE_URL',
  AuthToken = 'AUTH_TOKEN',
  CallerId = 'CALLER_ID',
  ClientIdentity = 'CLIENT_IDENTITY',
  EmailVerificationRegex = 'EMAIL_VERIFICATION_REGEX',
  FcmPushCredentialSid = 'FCM_PUSH_CREDENTIAL_SID',
  OutgoingApplicationSid = 'TWIML_APP_SID',
  Port = 'PORT',
}

function validateNumber(envVar: string): number | undefined {
  const num = Number(envVar);
  if (!isNaN(num)) return num;
}

export function getEnvVar(key: string): string | undefined {
  const val = process.env[key];
  if (typeof val !== 'undefined') return val;
}

export function getPort() {
  const portStr = getEnvVar(EnvVars.Port);
  if (typeof portStr === 'undefined') return;
  return validateNumber(portStr);
}

export function getServerCredentials(): ServerConfig | undefined {
  const envVars = [
    EnvVars.AccountSid,
    EnvVars.ApiKeySecret,
    EnvVars.ApiKeySid,
    EnvVars.Auth0Audience,
    EnvVars.Auth0IssuerBaseUrl,
    EnvVars.AuthToken,
    EnvVars.CallerId,
    EnvVars.OutgoingApplicationSid,
  ].map((envVarKey) => [envVarKey, getEnvVar(envVarKey)]);

  if (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    envVars.some(([_envVarKey, envVarVal]) => typeof envVarVal === 'undefined')
  ) {
    return;
  }

  // Optional variables
  const optionalEnvVars = [
    EnvVars.ApnPushCredentialSid,
    EnvVars.ClientIdentity,
    EnvVars.EmailVerificationRegex,
    EnvVars.FcmPushCredentialSid,
  ];
  optionalEnvVars.forEach((_optionalEnvVarKey) =>
    envVars.push([_optionalEnvVarKey, getEnvVar(_optionalEnvVarKey)]),
  );

  return Object.freeze(Object.fromEntries(envVars));
}
