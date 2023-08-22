type Listener = (...args: any[]) => void;

class BasicEventEmitter {
  listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener) {
    const newListeners = this.listeners.has(event)
      ? [...this.listeners.get(event)!, listener]
      : [listener];
    this.listeners.set(event, newListeners);
  }

  once(event: string, listener: Listener) {
    let hasFired: boolean = false;
    const wrappedListener = (...args: any[]) => {
      if (hasFired) {
        return;
      }
      hasFired = true;
      listener(...args);
    };
    this.on(event, wrappedListener);
  }

  emit(event: string, ...args: any[]) {
    const boundListeners = this.listeners.get(event);
    if (typeof boundListeners === 'undefined') {
      return;
    }
    for (const l of boundListeners) {
      l(...args);
    }
  }
}

export const voiceRegister = jest.fn().mockResolvedValue(undefined);

export const voiceConnect = jest.fn(async () =>
  createMockCall(`${callUuid++}`),
);

export const createMockCall = jest.fn((id: string) => {
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
    on: jest.fn(),
    once: jest.fn(),
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

export const Voice = jest.fn().mockImplementation(() => {
  const voiceEventEmitter = new BasicEventEmitter();
  const emit = voiceEventEmitter.emit.bind(voiceEventEmitter);
  const on = voiceEventEmitter.on.bind(voiceEventEmitter);
  const once = voiceEventEmitter.once.bind(voiceEventEmitter);
  return {
    connect: voiceConnect,
    emit,
    getCallInvites: voiceGetCallInvites,
    initializePushRegistry: voiceInitializePushRegistry,
    on,
    once,
    register: voiceRegister,
  };
});

(Voice as any).Event = {
  CallInvite: 'callInvite',
  CallInviteNotificationTapped: 'callInviteNotificationTapped',
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
