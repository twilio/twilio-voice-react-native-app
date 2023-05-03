import React from 'react';
import { type Props as RemoteParticipantProps } from '../../components/Call/RemoteParticipant';

export const useIncomingRemoteParticipant = () => {
  const [title] = React.useState<string>('foo');

  return {
    subtitle: 'Incoming Call',
    title,
  };
};

type HookReturnValue = {
  remoteParticipant: RemoteParticipantProps;
};

export const useIncomingCall = (): HookReturnValue => {
  return {
    remoteParticipant: useIncomingRemoteParticipant(),
  };
};
