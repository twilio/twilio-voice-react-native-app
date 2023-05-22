import { createStore, Store } from '../app';
import { bootstrapApp } from '../bootstrap';
import * as authStoreModule from '../../util/auth';
import * as accessTokenStoreModule from '../voice/accessToken';
import * as registrationStoreModule from '../voice/registration';
import * as auth0 from '../../../__mocks__/react-native-auth0';
import * as voiceSdk from '../../../__mocks__/@twilio/voice-react-native-sdk';

let fetchMock: jest.Mock;

jest.mock('../../../src/util/fetch', () => ({
  fetch: (fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('bootstrap', () => {
  let store: Store;
  let actionCreatorSpies: ReturnType<typeof spyOnActionCreators>;

  beforeAll(() => {
    actionCreatorSpies = spyOnActionCreators();
  });

  beforeEach(() => {
    store = createStore();
    jest.clearAllMocks();
  });

  const spyOnActionCreator = (module: any, actionCreator: string) => {
    const rejected = module[actionCreator].rejected;
    const spy = jest.spyOn(module, actionCreator);
    (spy as any).rejected = rejected;
    return spy;
  };

  const spyOnActionCreators = () => {
    const checkLoginStatusSpy = spyOnActionCreator(
      authStoreModule,
      'checkLoginStatus',
    );
    const getAccessTokenSpy = spyOnActionCreator(
      accessTokenStoreModule,
      'getAccessToken',
    );
    const registerSpy = spyOnActionCreator(registrationStoreModule, 'register');
    return {
      checkLoginStatusSpy,
      getAccessTokenSpy,
      registerSpy,
    };
  };

  describe('handles rejection', () => {
    it('checkLoginStatus', async () => {
      jest.spyOn(auth0, 'getCredentials').mockRejectedValueOnce(undefined);
      const { checkLoginStatusSpy, getAccessTokenSpy, registerSpy } =
        actionCreatorSpies;

      const bootstrapAppResult = await store.dispatch(bootstrapApp());
      expect(bootstrapAppResult.type).toEqual('app/bootstrap/fulfilled');
      expect(bootstrapAppResult.payload).toEqual('NOT_LOGGED_IN');

      expect(checkLoginStatusSpy.mock.calls).toEqual([[]]);
      expect(getAccessTokenSpy.mock.calls).toEqual([]);
      expect(registerSpy.mock.calls).toEqual([]);
    });

    it('getAccessToken', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
      });
      const { checkLoginStatusSpy, getAccessTokenSpy, registerSpy } =
        actionCreatorSpies;

      const bootstrapAppResult = await store.dispatch(bootstrapApp());
      expect(bootstrapAppResult.type).toEqual('app/bootstrap/rejected');

      expect(checkLoginStatusSpy.mock.calls).toEqual([[]]);
      expect(getAccessTokenSpy.mock.calls).toEqual([[]]);
      expect(registerSpy.mock.calls).toEqual([]);
    });

    it('register', async () => {
      jest.spyOn(voiceSdk, 'register').mockRejectedValueOnce(undefined);
      const { checkLoginStatusSpy, getAccessTokenSpy, registerSpy } =
        actionCreatorSpies;

      const bootstrapAppResult = await store.dispatch(bootstrapApp());
      expect(bootstrapAppResult.type).toEqual('app/bootstrap/rejected');

      expect(checkLoginStatusSpy.mock.calls).toEqual([[]]);
      expect(getAccessTokenSpy.mock.calls).toEqual([[]]);
      expect(registerSpy.mock.calls).toEqual([[]]);
    });
  });

  it('resolves when all sub-actions resolve', async () => {
    const { checkLoginStatusSpy, getAccessTokenSpy, registerSpy } =
      actionCreatorSpies;

    const bootstrapAppResult = await store.dispatch(bootstrapApp());
    expect(bootstrapAppResult.type).toEqual('app/bootstrap/fulfilled');
    expect(bootstrapAppResult.payload).toEqual('LOGGED_IN');

    expect(checkLoginStatusSpy.mock.calls).toEqual([[]]);
    expect(getAccessTokenSpy.mock.calls).toEqual([[]]);
    expect(registerSpy.mock.calls).toEqual([[]]);
  });
});
