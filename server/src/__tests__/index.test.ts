/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _server from '../server';
import * as _env from '../utils/env';
import * as _log from '../utils/log';

jest.mock('../server');
jest.mock('../utils/env');
jest.mock('../utils/log');

const server = jest.mocked(_server);
const env = jest.mocked(_env);
const log = jest.mocked(_log);

function runServer() {
  jest.isolateModules(() => require('../index'));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('main', () => {
  describe('port', () => {
    it('should get the port from the env vars', () => {
      runServer();

      expect(env.getPort.mock.calls).toEqual([[]]);
    });

    it('should listen on 3030 if not set', () => {
      env.getPort.mockReturnValueOnce(undefined);

      runServer();

      expect(server.createExpressApp.mock.results).toHaveLength(1);
      const app = server.createExpressApp.mock.results[0].value;
      expect(app.listen.mock.calls).toHaveLength(1);
      const [[port]] = app.listen.mock.calls;
      expect(port).toBe(3030);
    });

    it('should listen on the port if set', () => {
      env.getPort.mockReturnValueOnce(4004);

      runServer();

      expect(server.createExpressApp.mock.results).toHaveLength(1);
      const app = server.createExpressApp.mock.results[0].value;
      expect(app.listen.mock.calls).toHaveLength(1);
      const [[port]] = app.listen.mock.calls;
      expect(port).toBe(4004);
    });
  });

  describe('server credentials', () => {
    it('should create an app with the server credentials from the env vars', () => {
      runServer();

      expect(env.getServerCredentials.mock.results).toHaveLength(1);
      const retCreds = env.getServerCredentials.mock.results[0].value;
      expect(server.createExpressApp.mock.calls).toHaveLength(1);
      const argCreds = server.createExpressApp.mock.calls[0][0];
      expect(retCreds).toBe(argCreds);
    });

    it('should not create an app if there are incomplete credentials', () => {
      env.getServerCredentials.mockReturnValueOnce(undefined);

      runServer();

      expect(env.getServerCredentials.mock.results).toHaveLength(1);
      expect(server.createExpressApp.mock.calls).toHaveLength(0);
    });
  });

  it('should log when the app has started to listen', () => {
    server.createExpressApp.mockReturnValueOnce({
      listen: jest.fn().mockImplementation((_port, cb) => {
        cb();
      }),
    } as any);

    runServer();

    expect(log.log.mock.calls).toHaveLength(2);
  });
});
