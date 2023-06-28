/* eslint-disable @typescript-eslint/no-explicit-any */
const auth0Middleware = (req: any, res: any, next: any) => {
  req.auth = { token: 'some valid token' };
  next();
};

export const auth = () => jest.fn(auth0Middleware);
