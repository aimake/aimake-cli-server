'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var run = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_options, _callback) {
    var options, callback, port, firstBuild, server, httpsOpt, open, host, ipAddr, app, targetPort, address, printServerTable, buildSuccess;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _options;
            callback = _callback;
            // 端口号

            port = parseInt(options.serverPort, 10);
            firstBuild = true;
            server = null;
            httpsOpt = options.https;
            open = options.openBrowser;
            host = options.host;
            ipAddr = host || _ip2.default.address();
            app = (0, _express2.default)();
            targetPort = void 0;
            _context.prev = 11;
            _context.next = 14;
            return _util2.default.findPort(port, ipAddr);

          case 14:
            targetPort = _context.sent;
            _context.next = 20;
            break;

          case 17:
            _context.prev = 17;
            _context.t0 = _context['catch'](11);

            targetPort = port;

          case 20:
            if (targetPort !== port) {
              console.log(_chalk2.default.yellow('\nPort ' + port + ' has been occupied. It has automatically switched to ' + targetPort));
              port = targetPort;
              options.serverPort = targetPort;
            }
            address = (httpsOpt ? 'https' : 'http') + '://localhost:' + port;

            printServerTable = function printServerTable() {
              var proxyText = '';
              if (options.proxy) {
                proxyText = '\n      ' + _chalk2.default.yellow('Proxy service：') + '\n      Local proxy service\t=> http://' + ipAddr + ':' + options.proxyServer.proxyPort + '\n      Request proxy monitoring\t=> http://' + ipAddr + ':' + options.proxyServer.webPort;
              }
              console.log('\n      -------------- Service configuration --------------\n      Local IP address\t=> ' + ipAddr + '\n      Static resource service\t=> ' + address + '\n      ' + proxyText + '\n    ');
            };

            buildSuccess = function buildSuccess() {
              if (!firstBuild) {
                printServerTable();
                return;
              }
              firstBuild = false;

              printServerTable();
              if (open) {
                (0, _opn2.default)(address);
              }
              if (options.weinre) {
                (0, _opn2.default)(_xweinre2.default.run());
              }
            };

            if (httpsOpt) {
              server = _https2.default.createServer(credentials, app);
            } else {
              server = _http2.default.createServer(app);
            }

            // 开启代理软件

            if (!options.proxy) {
              _context.next = 28;
              break;
            }

            _context.next = 28;
            return (0, _proxy2.default)(options);

          case 28:

            /* ------- 中间件 ------- */
            // 支持跨域
            app.use(function (req, res, next) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , x-access-token');
              res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
              next();
            });

            // parse application/x-www-form-urlencoded
            app.use(_bodyParser2.default.urlencoded({ extended: false }));

            // parse application/json
            app.use(_bodyParser2.default.json());

            // 静态服务器
            app.use((0, _serveStatic2.default)('.'));

            // 远程调试脚本注入
            if (options.weinre) {
              _weinre2.default.inject(app, options);
            }

            // 编译
            if (options.webpackConfig) {
              (0, _webpack2.default)(app, options, buildSuccess);
            } else {
              // 只作静态服务器
              buildSuccess();
            }

            // 本地模拟数据
            (0, _mock2.default)(app, options);

            // 显示目录
            app.use((0, _serveIndex2.default)('.'));

            // historyApiFallback
            if (options.historyApiFallback === true) {
              app.use((0, _expressHistoryApiFallback2.default)('index.html', { root: process.cwd() }));
            }
            /* ------- 中间件 ------- */

            server.listen(port);

            callback && callback(app);

          case 39:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[11, 17]]);
  }));

  return function run(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = function (options, callback) {
  // 合并配置
  var combineOptions = _lodash2.default.defaults(options || {}, defaultOptions);
  // 启动服务器
  run(combineOptions, callback);
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _serveIndex = require('serve-index');

var _serveIndex2 = _interopRequireDefault(_serveIndex);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressHistoryApiFallback = require('express-history-api-fallback');

var _expressHistoryApiFallback2 = _interopRequireDefault(_expressHistoryApiFallback);

var _xweinre = require('xweinre');

var _xweinre2 = _interopRequireDefault(_xweinre);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

var _webpack = require('./webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _weinre = require('./weinre');

var _weinre2 = _interopRequireDefault(_weinre);

var _proxy = require('./tools/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var privateKey = _fs2.default.readFileSync(_path2.default.join(__dirname, '../ssl/server.key'), 'utf8');
var certificate = _fs2.default.readFileSync(_path2.default.join(__dirname, '../ssl/server.crt'), 'utf8');
var credentials = { key: privateKey, cert: certificate };
var defaultOptions = _config2.default.defaultOptions;

// hide webpack deprecation warning
process.noDeprecation = true;

module.exports = exports['default'];