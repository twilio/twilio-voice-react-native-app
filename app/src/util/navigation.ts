import { createNavigationContainerRef } from '@react-navigation/native';
import { type StackParamList } from '../screens/types';
import { setInterval } from './setTimeout';

export const navigationRef = createNavigationContainerRef<StackParamList>();

export async function getNavigate() {
  await new Promise<void>((resolve) => {
    const poll = () => {
      if (navigationRef.isReady()) {
        clearInterval(intervalId);
        resolve();
      }
    };
    const intervalId = setInterval(poll, 500);
    poll();
  });

  return navigationRef.navigate;
}
