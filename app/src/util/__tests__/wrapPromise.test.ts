import { wrapPromise } from '../wrapPromise';

describe('when given a promise that fulfills', () => {
  it('wraps the return value', async () => {
    const promiseResVal = 'some promise resolution thing';

    await expect(
      wrapPromise(Promise.resolve(promiseResVal)),
    ).resolves.toStrictEqual({
      status: 'fulfilled',
      value: promiseResVal,
    });
  });

  it('wraps no return value', async () => {
    await expect(wrapPromise(Promise.resolve())).resolves.toStrictEqual({
      status: 'fulfilled',
      value: undefined,
    });
  });
});

describe('when given a promise that rejects', () => {
  it('wraps the return value', async () => {
    const promiseResVal = 'some promise resolution thing';

    await expect(
      wrapPromise(Promise.reject(promiseResVal)),
    ).resolves.toStrictEqual({
      status: 'rejected',
      reason: promiseResVal,
    });
  });

  it('wraps no return value', async () => {
    await expect(wrapPromise(Promise.reject())).resolves.toStrictEqual({
      status: 'rejected',
      reason: undefined,
    });
  });
});

it('should never reject', async () => {
  const pFul = Promise.resolve();
  const pRej = Promise.reject();

  await expect(wrapPromise(pFul)).resolves.toBeTruthy();
  await expect(wrapPromise(pRej)).resolves.toBeTruthy();
});
