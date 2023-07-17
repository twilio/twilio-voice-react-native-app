import { createNavigationContainerRef } from '@react-navigation/native';
import { type StackParamList } from '../screens/types';

export const navigationRef = createNavigationContainerRef<StackParamList>();

export function getNavigate() {
  if (!navigationRef.isReady()) {
    return;
  }

  return navigationRef.navigate;
}
