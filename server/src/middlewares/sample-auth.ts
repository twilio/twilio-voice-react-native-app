import { Request, Response, NextFunction, RequestHandler } from 'express';
import { warn } from '../utils/log';

/**
 * ======================
 * DANGER! IMPORTANT NOTE
 * ======================
 *
 * This authentication middleware is _NOT_ fit for production deployments!
 *
 * Please consider a robust industry standard solution to authenticate and
 * authorize users for sensitive routes.
 *
 * This _sample_ middleware is meant _solely_ for development environments.
 */

/**
 * This middlware will set `res.locals.authentication` to an object with this
 * typing.
 *
 * Therefore, if a route or middleware can access `res.locals.authentication`,
 * then the request is authenticated.
 */
export interface Authentication {
  username: string;
}

/**
 * Sample "database". Maps a username to their password.
 */
const SAMPLE_DATABASE: Map<string, string> = new Map([
  ['alice', 'supersecretpassword1234'],
  ['bob', 'notverysecret'],
]);

/**
 * Checks a request to see if it was authenticated by this middleware.
 * @returns an object containing the authentication info, or undefined otherwise
 */
export function retrieveAuthentication(res: Response): Authentication | undefined {
  return res.locals.authentication;
}

/**
 * Sample auth middleware.
 *
 * _NOT_ fit for production deployment!
 *
 * @param req Express request object detailing the request passing through the
 * auth middleware
 * @param res Express response object to respond to the request
 * @param next the "next" function for Express to run
 */
function authenticateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { password, username } = req.body;

  if (typeof password !== 'string') {
    res.status(403).send('Password invalid.');
    return;
  }

  if (typeof username !== 'string') {
    res.status(403).send('Username invalid.');
    return;
  }

  if (SAMPLE_DATABASE.get(username) !== password) {
    res.status(403).send('Credentials invalid.');
    return;
  }

  res.locals.authentication = { username };
  next();
}

/**
 * Create a sample middlware function that authenticates requests.
 *
 * _NOT_ fit for production deployment!
 *
 * @returns an authentication middleware function, to be used by Express
 */
export function createSampleAuthenticationMiddleware(): RequestHandler {
  /**
   * Log a warning to console if this module is loaded.
   *
   * TODO, use console.error or .warn?
   */
  warn([
    '',
    '==========================================================',
    'Warning!',
    'This server is using the sample authentication middleware.',
    'It is _NOT_ fit for production environments.',
    '==========================================================',
    ''
  ].join('\n'));

  return authenticateMiddleware;
}
