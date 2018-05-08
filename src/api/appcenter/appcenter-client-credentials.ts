import { WebResource } from "ms-rest";

export class AppCenterClientCredentials {
  private getToken: () => Promise<string>;

  constructor(getToken: () => Promise<string>) {
    this.getToken = getToken;
  }

  public signRequest(request: WebResource, callback: {(err: Error): void}): void {
    this.getToken()
      .then((token) => {
        request.headers["x-api-token"] = token;
        callback(null);
      })
      .catch((err: Error) => {
        callback(err);
      });
  }
}
