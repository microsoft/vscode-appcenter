//
// Custom credentials object for talking to App Center Client
//

class AppCenterClientCredentials {
  constructor(token) {
    this.getToken = () => Promise.resolve(token);
  }

  signRequest(request, callback) {
    this.getToken()
      .then(token => {
        request.headers["x-api-token"] = token;
        callback(null);
      })
      .catch((err) => {
        callback(err);
      });
  }
}

module.exports = AppCenterClientCredentials;