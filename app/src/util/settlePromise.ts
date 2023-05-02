/**
 * Settles a Promise, wrapping fulfillments and rejections.
 *
 * @example
 * ```ts
 * const pFul = Promise.resolve('ahoy!');
 * const ful = await settlePromise(pFul);
 * // ful === { status: 'fulfilled', value: 'ahoy!' }
 *
 * const someError = new Error();
 * const pRej = Promise.reject(someError);
 * const rej = await settlePromise(pRej);
 * // rej === { status: 'rejected', reason: someError }
 * ```
 *
 * NOTE(mhuynh):
 *
 * The reason we would want to use a utility like this is because we lose type
 * information when asynchronously rejecting. In a `try-catch` block, the
 * `catch` block cannot give us any more information than a `catch` handler on a
 * Promise.
 *
 * If we wanted to perform several consecutive Promises, and we use `try-catch`
 * blocks, we _have_ to wrap all consecutive Promises in a single `try-catch`
 * because we would lose context between `try-catch` blocks. And if one Promise
 * were to reject, then that "catch-all" block has no information on which
 * Promise rejected.
 *
 * @param - a Promise to wrap
 * @returns a Promise that always resolves.
 */
export async function settlePromise<T>(
  promise: Promise<T>,
): Promise<
  { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }
> {
  return promise
    .then((value) => ({ status: 'fulfilled' as const, value }))
    .catch((reason) => ({ status: 'rejected' as const, reason }));
}
