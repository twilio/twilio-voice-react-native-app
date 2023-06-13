import { createNavigationContainerRef } from '@react-navigation/native';
import { type StackParamList } from '../screens/types';

export const navigationRef = createNavigationContainerRef<StackParamList>();

export function navigate(name: keyof StackParamList) {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate(name);
}
