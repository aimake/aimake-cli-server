'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = proxy;

var _anyproxy = require('anyproxy');

var _anyproxy2 = _interopRequireDefault(_anyproxy);

var _rules = require('./rules');

var _rules2 = _interopRequireDefault(_rules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function proxy(options) {
  var proxyConfig = options.proxyServer;
  return new _promise2.default(function (resolve, reject) {
    var config = {
      port: proxyConfig.proxyPort || 8080,
      rule: (0, _rules2.default)(options),
      webInterface: {
        enable: true,
        webPort: proxyConfig.webPort || 8000,
        wsPort: proxyConfig.wsPort || 8003
      },
      throttle: proxyConfig.throttle || 1000,
      forceProxyHttps: false,
      silent: true
    };

    if (proxyConfig.silent === false) {
      config.silent = false;
    }

    var proxyServer = new _anyproxy2.default.ProxyServer(config);
    proxyServer.start();

    proxyServer.on('ready', function () {
      resolve();
    });
    proxyServer.on('error', function () {
      reject();
    });
  });
}