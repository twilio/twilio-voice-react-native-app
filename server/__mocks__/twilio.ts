const AccessToken: any = jest.fn().mockReturnValue({
  addGrant: jest.fn(),
  toJwt: jest.fn().mockReturnValue('mock-accesstoken-tojwt-foobar'),
});

AccessToken.VoiceGrant = jest.fn();

export const jwt: { AccessToken: jest.Mock & { VoiceGrant: jest.Mock } } = {
  AccessToken,
};

const dial = jest.fn().mockReturnValue({
  client: jest.fn(),
  number: jest.fn(),
});

const voiceResponseToString = jest.fn().mockReturnValue('mock-voiceresponse-tostring-foobar');

const VoiceResponse = jest.fn().mockReturnValue({
  dial,
  toString: voiceResponseToString,
});

export const twiml = {
  VoiceResponse,
};
