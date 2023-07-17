import * as dotenv from 'dotenv';
import type { ServerCredentials } from '../common/types';

dotenv.config();

export enum EnvVars {
  AccountSid = 'ACCOUNT_SID',
  ApiKeySecret = 'API_KEY_SECRET',
  AuthToken = 'AUTH_TOKEN',
  ApiKeySid = 'API_KEY_SID',
  CallerId = 'CALLER_ID',
  OutgoingApplicationSid = 'TWIML_APP_SID',
  Port = 'PORT',
  ApnPushCredentialSid = 'APN_PUSH_CREDENTIAL_SID',
  FcmPushCredentialSid = 'FCM_PUSH_CREDENTIAL_SID',
  Auth0Audience = 'AUTH0_AUDIENCE',
  Auth0IssuerBaseUrl = 'AUTH0_ISSUER_BASE_URL',
  EmailVerificationRegex = 'EMAIL_VERIFICATION_REGEX',
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

export function getServerCredentials(): ServerCredentials | undefined {
  const envVars = [
    EnvVars.AccountSid,
    EnvVars.ApiKeySecret,
    EnvVars.AuthToken,
    EnvVars.ApiKeySid,
    EnvVars.CallerId,
    EnvVars.OutgoingApplicationSid,
    EnvVars.Auth0Audience,
    EnvVars.Auth0IssuerBaseUrl,
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
    EnvVars.EmailVerificationRegex,
    EnvVars.FcmPushCredentialSid,
  ];
  optionalEnvVars.forEach((_optionalEnvVarKey) =>
    envVars.push([_optionalEnvVarKey, process.env[_optionalEnvVarKey]]),
  );

  return Object.freeze(Object.fromEntries(envVars));
}
