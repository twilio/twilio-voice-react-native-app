import { Request, Response } from 'express';
import { ServerCredentials } from '../common/types';
import { error } from '../utils/log';

export function createAuth0Route(serverCredentials: ServerCredentials) {
  const errorMsg = (msg: string) => {
    error(`/auth0AccessToken ${msg}`);
  };
  return async function auth0Route(req: Request, res: Response) {
    var axios = require('axios').default;

    var options = {
      method: 'POST',
      url: serverCredentials.AUTH0_URL,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'password',
        username: serverCredentials.AUTH0_USERNAME,
        password: serverCredentials.AUTH0_PASSWORD,
        audience: serverCredentials.AUTH0_AUDIENCE,
        scope: 'openid profile email',
        client_id: serverCredentials.AUTH0_CLIENT_ID,
        client_secret: serverCredentials.AUTH0_CLIENT_SECRET,
      }),
    };

    axios
      .request(options)
      .then(function (response: any) {
        res
          .header('Content-Type', 'application/json')
          .status(200)
          .send(response.data);
      })
      .catch(function (error: any) {
        errorMsg(JSON.stringify(error));
        res
          .header('Content-Type', 'text/plain')
          .status(400)
          .send('create Auth0 Access Token Route error');
      });
  };
}
