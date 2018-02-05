/* eslint-disable require-yield, consistent-return */

export default function rules(options) {
  return {
    * beforeSendRequest(requestDetail) {
      const hostname = requestDetail.requestOptions.hostname;
      const hosts = options.proxyServer.host;
      if (hosts.indexOf(hostname) !== -1) {
        const newRequestOptions = requestDetail.requestOptions;
        newRequestOptions.hostname = '127.0.0.1';
        return {
          requestOptions: newRequestOptions,
        };
      }
    },
  };
}
