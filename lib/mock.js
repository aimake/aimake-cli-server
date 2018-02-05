'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = mock;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _request = require('./tools/request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REGEXP_OPTIONAL_PARAM = /\((.*?)\)/g;
var REGEXP_NAMED_PARAM = /(\(\?)?:\w+/g;
var REGEXP_SPLAT_PARAM = /\*\w+/g;
var REGEXP_ESCAPE = /[-{}[\]+?.,\\^$|#\s]/g;

function routeToRegExp(_route) {
  var route = _route.replace(REGEXP_ESCAPE, '\\$&').replace(REGEXP_OPTIONAL_PARAM, '(?:$1)?').replace(REGEXP_NAMED_PARAM, function (match, optional) {
    return optional ? match : '([^/?]+)';
  }).replace(REGEXP_SPLAT_PARAM, '([^?]*?)');
  return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
}

function mock(app, options) {
  var mockApiPath = _path2.default.join(process.cwd(), options.mockapi);

  var matchRules = function matchRules(url) {
    var result = null;
    var apiRule = void 0;
    // 读取规则配置文件
    try {
      delete require.cache[mockApiPath];
      apiRule = require(mockApiPath);
    } catch (e) {
      apiRule = {};
    }
    // 规则正则匹配
    var rules = apiRule.rules || {};
    (0, _keys2.default)(rules).forEach(function (key) {
      var routeReg = routeToRegExp(key);
      if (routeReg.test(url)) {
        result = rules[key];
      }
    });
    return result;
  };

  app.use('*', function (req, res, next) {
    var apiRule = void 0;
    try {
      delete require.cache[mockApiPath];
      apiRule = require(mockApiPath);
    } catch (e) {
      apiRule = {};
    }
    if (!matchRules(req.originalUrl)) {
      // 兼容不在匹配规则下面的
      if (req.originalUrl.indexOf('mock') !== -1) {
        // 远程代理
        if (apiRule.proxy === true && apiRule.proxyServer) {
          (0, _request2.default)(apiRule.proxyServer, req, res);
          return;
        }
        // 本地数据
        if (_fs2.default.existsSync(process.cwd() + req.originalUrl)) {
          var stream = _fs2.default.createReadStream(process.cwd() + req.originalUrl);
          console.log('Mock data: ' + _chalk2.default.yellow(req.originalUrl) + ' => ' + _chalk2.default.yellow(process.cwd() + req.originalUrl));
          stream.pipe(res);
        } else {
          // 找不到文件
          console.log(_chalk2.default.red('Mock error: ' + _chalk2.default.yellow(req.originalUrl) + ' can not find ' + _chalk2.default.yellow(process.cwd() + req.originalUrl)));
          res.end((0, _stringify2.default)({ message: 'Mock not found' }));
        }
        return;
      }
      next();
      return;
    }
    // 远程代理
    if (apiRule.proxy === true && apiRule.proxyServer) {
      (0, _request2.default)(apiRule.proxyServer, req, res);
      return;
    }
    // 本地数据模拟
    var key = req.originalUrl;
    var value = matchRules(req.originalUrl);
    var mockPath = _path2.default.join(_path2.default.dirname(mockApiPath), value);
    if (_fs2.default.existsSync(mockApiPath)) {
      console.log('Mock data: ' + _chalk2.default.yellow(key) + ' => ' + _chalk2.default.yellow(mockPath));
      delete require.cache[mockPath];
      if (_path2.default.extname(mockPath) === '.json') {
        if (req.query.callback) {
          // jsonp
          var str = req.query.callback + '(' + (0, _stringify2.default)(require(mockPath)) + ')';
          res.end(str);
        } else {
          // json
          res.send(require(mockPath));
        }
      } else if (_path2.default.extname(mockPath) === '.js') {
        // JS定义接口返回
        var fn = require(mockPath);
        fn(req, res, next);
      } else {
        next();
      }
    } else {
      // 找不到文件
      console.log(_chalk2.default.red('Mock error: ' + _chalk2.default.yellow(req.originalUrl) + ' can not find ' + _chalk2.default.yellow(mockApiPath)));
      res.end((0, _stringify2.default)({ message: 'mock not found' }));
    }
  });
}