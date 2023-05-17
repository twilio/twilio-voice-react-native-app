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
  PushCredentialSid = 'PUSH_CREDENTIAL_SID',
  Auth0Audience = 'AUTH0_AUDIENCE',
  Auth0IssuerBaseUrl = 'AUTH0_ISSUER_BASE_URL',
  Auth0Url = 'AUTH0_URL',
  Auth0Username = 'AUTH0_USERNAME',
  Auth0Password = 'AUTH0_PASSWORD',
  Auth0ClientID = 'AUTH0_CLIENT_ID',
  Auth0ClientSecret = 'AUTH0_CLIENT_SECRET',
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
    EnvVars.PushCredentialSid,
    EnvVars.Auth0Audience,
    EnvVars.Auth0IssuerBaseUrl,
    EnvVars.Auth0Url,
    EnvVars.Auth0Username,
    EnvVars.Auth0Password,
    EnvVars.Auth0ClientID,
    EnvVars.Auth0ClientSecret,
  ].map((envVarKey) => [envVarKey, getEnvVar(envVarKey)]);

  if (
    envVars.some(([_envVarKey, envVarVal]) => typeof envVarVal === 'undefined')
  ) {
    return;
  }

  return Object.freeze(Object.fromEntries(envVars));
}
