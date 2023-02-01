import * as dotenv from 'dotenv';
import type { TwilioCredentials } from '../common/types';

dotenv.config();

export enum EnvVars {
  AccountSid = 'ACCOUNT_SID',
  ApiKeySecret = 'API_KEY_SECRET',
  ApiKeySid = 'API_KEY_SID',
  CallerId = 'CALLER_ID',
  OutgoingApplicationSid = 'OUTGOING_APPLICATION_SID',
  Port = 'PORT',
  PushCredentialSid = 'PUSH_CREDENTIAL_SID',
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

export function getTwilioCredentials(): TwilioCredentials | undefined {
  const envVars = [
    EnvVars.AccountSid,
    EnvVars.ApiKeySecret,
    EnvVars.ApiKeySid,
    EnvVars.CallerId,
    EnvVars.OutgoingApplicationSid,
    EnvVars.PushCredentialSid,
  ].map((envVarKey) => [
    envVarKey, getEnvVar(envVarKey)
  ]);

  if (
    envVars.some(([_envVarKey, envVarVal]) => typeof envVarVal === 'undefined')
  ) {
    return;
  }

  return Object.freeze(Object.fromEntries(envVars));
}
