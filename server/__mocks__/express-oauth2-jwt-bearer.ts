const auth0Middleware = (req: any, res: any, next: any) => next();

export const auth = () => jest.fn(auth0Middleware);
