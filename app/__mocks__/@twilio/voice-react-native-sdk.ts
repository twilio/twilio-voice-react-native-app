export const voiceRegister = jest.fn().mockResolvedValue(undefined);

export const voiceOn = jest.fn();

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

let callUuid = 0;

export const Voice = jest.fn().mockReturnValue({
  connect: voiceConnect,
  getCallInvites: voiceGetCallInvites,
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
