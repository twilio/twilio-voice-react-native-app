import * as navigationUtil from '../navigation';
import * as setTimeoutUtil from '../setTimeout';
import * as mockNavigationLib from '../../../__mocks__/@react-navigation/native';

describe('navigation util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('polls until ready', async () => {
    const setIntervalSpy = jest.spyOn(setTimeoutUtil, 'setInterval');

    const navRefPromise = navigationUtil.getNavigate();

    expect(setIntervalSpy.mock.calls).toHaveLength(1);
    const [[fn]] = setIntervalSpy.mock.calls;
    expect(typeof fn).toStrictEqual('function');

    mockNavigationLib.mockNavigationContainerRef.isReady.mockReturnValueOnce(
      true,
    );
    expect(fn).not.toThrow();
    const navRef = await navRefPromise;

    expect(navRef).toBe(mockNavigationLib.mockNavigationContainerRef);
  });

  it('does not poll if immediately ready', async () => {
    const setIntervalSpy = jest.spyOn(setTimeoutUtil, 'setInterval');

    mockNavigationLib.mockNavigationContainerRef.isReady.mockReturnValueOnce(
      true,
    );
    const navRefPromise = navigationUtil.getNavigate();

    expect(setIntervalSpy.mock.calls).toHaveLength(0);

    const navRef = await navRefPromise;
    expect(navRef).toBe(mockNavigationLib.mockNavigationContainerRef);
  });
});
