export const voiceRegister = jest.fn().mockResolvedValue(undefined);

export const voiceOn = jest.fn();

export const voiceConnect = jest.fn(async () =>
  createMockCall(`${callUuid++}`),
);

export const voiceGetCalls = jest.fn(() => {
  return Promise.resolve(new Map());
});

export const createMockCall = jest.fn((id: string) => {
  const listeners: Map<string, ((...args: any[]) => any)[]> = new Map();
  const mockCall = {
    _uuid: `mock uuid ${id}`,
    disconnect: jest.fn().mockResolvedValue(undefined),
    mute: jest.fn().mockResolvedValue(false),
    hold: jest.fn().mockResolvedValue(false),
    sendDigits: jest.fn().mockResolvedValue(undefined),
    getSid: jest.fn().mockReturnValue(`mock sid ${id}`),
    getCustomParameters: jest
      .fn()
      .mockReturnValue(`mock custom parameters ${id}`),
    getFrom: jest.fn().mockReturnValue(`mock from ${id}`),
    getInitialConnectedTimestamp: jest.fn().mockReturnValue(42),
    getState: jest.fn().mockReturnValue(`mock state ${id}`),
    getTo: jest.fn().mockReturnValue(`mock to ${id}`),
    isMuted: jest.fn().mockReturnValue(false),
    isOnHold: jest.fn().mockReturnValue(false),
    on: jest
      .fn()
      .mockImplementation(
        (event: string, listener: (...args: any[]) => void) => {
          const newListeners = listeners.has(event)
            ? [...listeners.get(event)!, listener]
            : [listener];
          listeners.set(event, newListeners);
        },
      ),
    once: jest
      .fn()
      .mockImplementation(
        (event: string, listener: (...args: any[]) => void) => {
          let didWrappedListenerFire = false;
          const wrappedListener = (...argsPrime: any[]) => {
            if (didWrappedListenerFire) {
              return;
            }
            didWrappedListenerFire = true;
            listener(...argsPrime);
          };
          const newListeners = listeners.has(event)
            ? [...listeners.get(event)!, wrappedListener]
            : [wrappedListener];
          listeners.set(event, newListeners);
        },
      ),
    emit: (event: string, ...args: any[]) => {
      const eventListeners = listeners.get(event);
      if (!eventListeners) {
        return;
      }
      for (const listener of eventListeners) {
        listener(...args);
      }
    },
  };
  return mockCall;
});

export const createMockCallInvite = jest.fn((id: string) => ({
  _uuid: `mock uuid ${id}`,
  accept: jest.fn(async () => createMockCall(id)),
  getCallSid: jest.fn().mockReturnValue(`mock call sid ${id}`),
  getCustomParameters: jest
    .fn()
    .mockReturnValue(`mock custom parameters ${id}`),
  getFrom: jest.fn().mockReturnValue(`mock from ${id}`),
  getState: jest.fn().mockReturnValue(`mock state ${id}`),
  getTo: jest.fn().mockReturnValue(`mock to ${id}`),
  reject: jest.fn(async () => createMockCall(id)),
}));

export const voiceGetCallInvites = jest.fn().mockResolvedValue(
  new Map([
    ['mock uuid 1', createMockCallInvite('1')],
    ['mock uuid 2', createMockCallInvite('2')],
  ]),
);

export const voiceInitializePushRegistry = jest
  .fn()
  .mockResolvedValue(undefined);

let callUuid = 0;

export const Voice = jest.fn().mockReturnValue({
  connect: voiceConnect,
  getCalls: voiceGetCalls,
  getCallInvites: voiceGetCallInvites,
  initializePushRegistry: voiceInitializePushRegistry,
  on: voiceOn,
  register: voiceRegister,
});

(Voice as any).Event = {
  CallInvite: 'mock call invite event key',
};

export const Call = {
  Event: {
    Connected: 'connected',
    ConnectFailure: 'connectFailure',
    Disconnected: 'disconnected',
    Reconnecting: 'reconnecting',
    Reconnected: 'reconnected',
    Ringing: 'ringing',
    QualityWarningsChanged: 'qualityWarningsChanged',
  },
};

export const AudioDevice = {
  Type: {
    Earpiece: 'earpiece',
    Speaker: 'speaker',
    Bluetooth: 'bluetooth',
  },
};
