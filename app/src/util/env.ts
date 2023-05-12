import Config from 'react-native-config';

export const getEnvVariable = (envVar: string): string => {
  if (envVar in Config && typeof Config.envVar !== 'undefined') {
    return Config.envVar;
  } else {
    console.error(`Missing ${envVar} in .env`);
    return '';
  }
};
