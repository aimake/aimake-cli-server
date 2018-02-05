import AnyProxy from 'anyproxy';
import rules from './rules';

export default function proxy(options) {
  const proxyConfig = options.proxyServer;
  return new Promise((resolve, reject) => {
    const config = {
      port: proxyConfig.proxyPort || 8080,
      rule: rules(options),
      webInterface: {
        enable: true,
        webPort: proxyConfig.webPort || 8000,
        wsPort: proxyConfig.wsPort || 8003,
      },
      throttle: proxyConfig.throttle || 1000,
      forceProxyHttps: false,
      silent: true,
    };

    if (proxyConfig.silent === false) {
      config.silent = false;
    }

    const proxyServer = new AnyProxy.ProxyServer(config);
    proxyServer.start();

    proxyServer.on('ready', () => {
      resolve();
    });
    proxyServer.on('error', () => {
      reject();
    });
  });
}
