import { log, warn, error } from '../../utils/log';

import * as winston from '../../utils/log';

describe('log utils', () => {
  it('should log a message with level: info', () => {
    const winstonLog = jest.spyOn(winston, 'log');
    const message = 'log info test';
    log(message);
    expect(winstonLog).toHaveBeenCalledWith(message);
  });
  it('should log a message with level: warn', () => {
    const winstonWarn = jest.spyOn(winston, 'warn');
    const message = 'log warn test';
    warn(message);
    expect(winstonWarn).toHaveBeenCalledWith(message);
  });
  it('should log a message with level: error', () => {
    const winstonError = jest.spyOn(winston, 'error');
    const message = 'log error test';
    error(message);
    expect(winstonError).toHaveBeenCalledWith(message);
  });
});
