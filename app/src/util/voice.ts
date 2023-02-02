import {
  Voice,
  type Call,
  type AudioDevice,
} from '@twilio/voice-react-native-sdk';

export const voice = new Voice();

export const callMap = new Map<string, Call>();

export const audioDeviceMap = new Map<string, AudioDevice>();
