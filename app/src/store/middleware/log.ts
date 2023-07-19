import { type Middleware } from '@reduxjs/toolkit';
import { type Dispatch, type State } from '../app';

export type LogOptions = Readonly<{
  logStackTrace?: boolean;
}>;

export const logMiddlewareDefaultOptions: LogOptions = Object.freeze({
  logStackTrace: false,
});

export const createLogMiddleware: (
  options?: LogOptions,
) => Middleware<{}, State, Dispatch> =
  ({ logStackTrace } = logMiddlewareDefaultOptions) =>
  () =>
  (next) =>
  (action) => {
    let message: string = action.type;

    if (action.type.match(/\/rejected$/g)) {
      const error = action.payload || action.error;

      const filteredError = logStackTrace
        ? error
        : filterOutKey('stack', error);

      message += ' ' + JSON.stringify(filteredError, null, 2);
    }

    console.log(message);

    return next(action);
  };

/**
 * Recursively filter out a key from an object.
 */
const filterOutKey = (
  key: string,
  obj: Record<string, any>,
): Record<string, any> => {
  return Object.entries(obj).reduce((reduction, [k, v]) => {
    if (k === key) {
      return reduction;
    }

    if (typeof v === 'object' && v !== null) {
      return { ...reduction, [k]: filterOutKey(key, v) };
    }

    return { ...reduction, [k]: v };
  }, {});
};
