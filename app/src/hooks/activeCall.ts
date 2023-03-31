import React from 'react';
import { useSelector } from 'react-redux';
import { type State } from '../store/app';
import { type ActiveCall } from '../store/voice/call/activeCall';
import { setTimeout } from '../util/setTimeout';

/**
 * Default time interval for updating the state of the active call time.
 */
const DEFAULT_TIME_INTERVAL_UPDATE_MS = 250;

/**
 * Active call hook. Selects the active call from the application state.
 * @returns the active call
 */
export const useActiveCall = () => {
  const activeCall = useSelector<State, ActiveCall>(
    (store) => store.voice.call.outgoingCall,
  );

  return activeCall;
};

/**
 * Active call status hook. Returns the status of a call in a human-readable
 * format. If the call is ongoing, i.e. has state "connected", then returns
 * a formatted time. Introduces statefullness via the {@link useActiveCallTime}
 * hook.
 * @param activeCall - The active call.
 * @param activeCallTimeMs - The time the call has been active for.
 * @returns - The active call status.
 */
export const useActiveCallStatus = (
  activeCall: ActiveCall,
  timeIntervalUpdateMs?: number,
) => {
  const activeCallTimeMs = useActiveCallTime(activeCall, timeIntervalUpdateMs);

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

  return callStatus;
};

/**
 * Active call remote participant identity hook.
 * @param activeCall - The active call.
 * @returns - The remote participant identity.
 */
export const useActiveCallRemoteParticipant = (activeCall: ActiveCall) => {
  const remoteParticipantId = React.useMemo<string>(() => {
    if (activeCall?.status !== 'fulfilled') {
      return '';
    }

    return activeCall.to || '';
  }, [activeCall]);

  return remoteParticipantId;
};

/**
 * Active call time hook. Introduces state to a React component that uses this
 * hook. Keeps track of milliseconds passed since the initial connect event of
 * the active call.
 * @param activeCall - The active call.
 * @param timeIntervalUpdateMs - Time between animation frame requests for
 * updating the active time of the call. Optional - defaults to `250`.
 * @returns - The time in milliseconds since the first call connect event.
 */
export const useActiveCallTime = (
  activeCall: ActiveCall,
  timeIntervalUpdatesMs: number = DEFAULT_TIME_INTERVAL_UPDATE_MS,
) => {
  const [activeCallTimeMs, setActiveCallTimeMs] = React.useState<number | null>(
    null,
  );

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
          timeoutId = setTimeout(animate, timeIntervalUpdatesMs);
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
  }, [activeCall, timeIntervalUpdatesMs]);

  return activeCallTimeMs;
};
