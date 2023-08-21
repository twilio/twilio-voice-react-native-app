import React from 'react';
import { useSelector } from 'react-redux';
import { match, P } from 'ts-pattern';
import { type State } from '../store/app';
import { type ActiveCall } from '../store/voice/call/activeCall';
import { setTimeout, requestAnimationFrame } from '../util/setTimeout';

/**
 * Default time interval for updating the state of the active call time.
 */
const DEFAULT_TIME_INTERVAL_UPDATE_MS = 250;

/**
 * Active call hook. Selects the active call from the application state.
 *
 * TODO(mhuynh):
 * Revisit for active call heuristics. Currently this function may anticipate
 * multiple calls and will select the most recent one.
 *
 * @returns - The active call.
 */
export const useActiveCall = (callSid?: string): ActiveCall | undefined => {
  const activeCall = useSelector<State, ActiveCall | undefined>((store) => {
    const { entities: callEntities, ids: callIds } =
      store.voice.call.activeCall;

    if (typeof callSid === 'undefined') {
      return callEntities[callIds[callIds.length - 1]];
    }

    const foundCallEntity = Object.values(callEntities).find((callEntity) => {
      if (callEntity?.status !== 'fulfilled') {
        return false;
      }

      return callEntity.info.sid === callSid;
    });

    return foundCallEntity;
  });

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
export const useActiveCallDuration = (
  activeCall: ActiveCall | undefined,
  timeIntervalUpdateMs?: number,
) => {
  const activeCallTimeMs = useActiveCallTime(activeCall, timeIntervalUpdateMs);

  const callStatus = React.useMemo<string>(
    () =>
      match([activeCall, activeCallTimeMs])
        .with(
          [{ info: { state: 'connected' } }, P.not(P.nullish)],
          ([_, t]) => {
            const totalSeconds = Math.floor(t / 1000);
            const totalMinutes = Math.floor(totalSeconds / 60);
            const remainderSeconds = Math.floor(totalSeconds % 60);

            const minutes = String(totalMinutes).padStart(2, '0');
            const seconds = String(remainderSeconds).padStart(2, '0');

            return `${minutes}:${seconds}`;
          },
        )
        .with([{ info: { state: P.select(P.string) } }, P._], (callState) => {
          return callState;
        })
        .otherwise(() => ''),
    [activeCall, activeCallTimeMs],
  );

  return callStatus;
};

/**
 * Active call remote participant identity hook.
 * @param activeCall - The active call.
 * @returns - A string representing the remote participant identity.
 */
export const useActiveCallRemoteParticipant = (
  activeCall: ActiveCall | undefined,
) => {
  const remoteParticipantId = React.useMemo<string>(
    () =>
      match(activeCall)
        .with(
          { direction: 'incoming', status: 'fulfilled' },
          (c) => c.info.from || '',
        )
        .with({ direction: 'outgoing' }, (c) => c.to)
        .otherwise(() => ''),
    [activeCall],
  );

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
  activeCall: ActiveCall | undefined,
  timeIntervalUpdatesMs: number = DEFAULT_TIME_INTERVAL_UPDATE_MS,
) => {
  const [activeCallTimeMs, setActiveCallTimeMs] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    let timeoutId: number | null = null;
    let animationFrameId: number | null = null;
    let doneAnimating: boolean = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(() => {
        match(activeCall)
          .with(
            {
              info: {
                state: P.not('disconnected'),
                initialConnectedTimestamp: P.not(undefined),
              },
            },
            (c) => {
              setActiveCallTimeMs(
                Date.now() - c.info.initialConnectedTimestamp,
              );
              if (!doneAnimating) {
                timeoutId = setTimeout(animate, timeIntervalUpdatesMs);
              }
            },
          )
          .otherwise(() => {});
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
