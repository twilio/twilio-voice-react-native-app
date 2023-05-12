import { getEnvVariable } from './env';
export const fetch = globalThis.fetch;
export const defaultUrl = getEnvVariable('DEFAULT_URL');
