import * as user from '../src/store/user';
import * as app from '../src/store/app';
import * as token from '../src/store/voice/token';
import * as outgoingCall from '../src/store/voice/outgoingCall';

let fetchMock: jest.Mock;
let voiceConnectMock: jest.Mock;

jest.mock('../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn()),
}));

jest.mock('../src/util/voice', () => ({
  voice: {
    connect: (voiceConnectMock = jest.fn()),
  },
}));

it.skip('works good', async () => {
  console.log(app.store.getState());

  fetchMock.mockResolvedValueOnce(undefined);
  const authAction = user.authenticateUser({ username: 'foo', password: 'bar' });
  await app.store.dispatch(authAction);

  console.log(app.store.getState());

  fetchMock.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValueOnce({
      token: 'foo',
    }),
  });
  const getTokenAction = token.getToken();
  await app.store.dispatch(getTokenAction);

  console.log(app.store.getState());

  voiceConnectMock.mockResolvedValueOnce({
    'this is a': 'mock call',
  });
  const makeOutgoingCallAction = outgoingCall.makeOutgoingCall({ identity: 'bob' });
  await app.store.dispatch(makeOutgoingCallAction);

  console.log(app.store.getState());
});


it('works', async () => {
  console.log(app.store.getState());

  let deferredResolve: (...args: any) => void = () => {};
  let deferredReject: (...args: any) => void = () => {};
  const deferredPromise = new Promise((resolve, reject) => {
    deferredResolve = resolve;
    deferredReject = reject;
  });

  fetchMock.mockReturnValueOnce(deferredPromise);
  const authAction = user.authenticateUser({ username: 'foo', password: 'bar' });
  const authPromise = app.store.dispatch(authAction);

  console.log(app.store.getState());

  deferredReject();

  await authPromise;

  console.log(app.store.getState());

  fetchMock.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValueOnce({
      token: 'foo',
    }),
  });
  const getTokenAction = token.getToken();
  await app.store.dispatch(getTokenAction);

  console.log(app.store.getState());

  voiceConnectMock.mockResolvedValueOnce({
    'this is a': 'mock call',
  });
  const makeOutgoingCallAction = outgoingCall.makeOutgoingCall({ identity: 'bob' });
  await app.store.dispatch(makeOutgoingCallAction);

  console.log(app.store.getState());
});
