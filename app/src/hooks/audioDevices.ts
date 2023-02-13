import { useSelector } from 'react-redux';
import { type State } from '../store/app';

export const useAudioDevices = () => {
  const audioDevices = useSelector((state: State) => state.voice.audioDevices);

  return audioDevices;
};
