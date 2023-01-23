import { Voice, type Call } from '@twilio/voice-react-native-sdk';

export const voice = new Voice();

export const callMap = new Map<string, Call>();
