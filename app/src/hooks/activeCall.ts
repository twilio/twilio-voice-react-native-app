import React from 'react';
import { useSelector } from 'react-redux';
import { type State } from '../store/app';

export const useActiveCall = () => {
  const activeCall = useSelector<State, State['voice']['call']['outgoingCall']>(
    (store) => store.voice.call.outgoingCall,
  );

  const [activeCallTimeMs, setActiveCallTimeMs] = React.useState<number | null>(
    null,
  );

  const remoteParticipantId = React.useMemo<string>(() => {
    if (activeCall?.status !== 'fulfilled') {
      return '';
    }

    return activeCall.to || '';
  }, [activeCall]);

  const callStatus = React.useMemo<string>(() => {
    if (activeCall?.status !== 'fulfilled') {
      return '';
    }

    const state = activeCall.callInfo.state;
    if (state !== 'connected') {
      return state || '';
    }

    if (!activeCallTimeMs) {
      return '';
    }

    const totalSeconds = Math.floor(activeCallTimeMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainderSeconds = Math.floor(totalSeconds % 60);

    const minutesRepr = String(totalMinutes).padStart(2, '0');
    const secondsRepr = String(remainderSeconds).padStart(2, '0');

    return `${minutesRepr}:${secondsRepr}`;
  }, [activeCall, activeCallTimeMs]);

  React.useEffect(() => {
    let timeoutId: number | null;
    let animationFrameId: number | null;
    let doneAnimating: boolean = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(() => {
        if (
          activeCall?.status !== 'fulfilled' ||
          typeof activeCall.initialConnectTimestamp === 'undefined'
        ) {
          return;
        }
        setActiveCallTimeMs(Date.now() - activeCall.initialConnectTimestamp);

        if (!doneAnimating) {
          timeoutId = setTimeout(animate, 333);
        }
      });
    };

    animate();

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      doneAnimating = true;
    };
  }, [activeCall]);

  return {
    activeCall,
    activeCallTimeMs,
    callStatus,
    remoteParticipantId,
  };
};
