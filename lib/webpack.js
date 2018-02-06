'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = function (app, options, callback) {
  var webpackConfig = options.webpackConfig;
  if (options.hotLoad) {
    // 热更新设置
    injectHMR(options);
  }
  try {
    initProgress(webpackConfig);
    var compiler = (0, _webpack2.default)(webpackConfig);
    compiler.apply(new _webpack2.default.ProgressPlugin(function (percentage) {
      if (percentage >= 1) {
        setTimeout(function () {
          callback && callback();
        }, 0);
      }
    }));
    var middleware = (0, _webpackDevMiddleware2.default)(compiler, compilerOption(webpackConfig));
    app.use(middleware);
    app.use((0, _webpackHotMiddleware2.default)(compiler));
  } catch (e) {
    console.log(_chalk2.default.red('Compile error, exit.\n'));
    console.log(e);
    process.exit(1);
  }
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compilerOption() {
  return {
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
      children: false
    }
  };
}

function initProgress(webpackConfig) {
  var chars = 0;
  webpackConfig.plugins.push(new _webpack2.default.ProgressPlugin(function (_percentage, _msg) {
    var percentage = _percentage;
    var msg = _msg;
    function lineStart(message) {
      var str = '';
      for (; chars > message.length; chars -= 1) {
        str += '\b \b';
      }
      chars = message.length;
      for (var i = 0; i < chars; i += 1) {
        str += '\b';
      }
      if (str) process.stderr.write(str);
    }
    if (percentage < 1) {
      percentage = Math.floor(percentage * 100);
      msg = percentage + '% ' + msg;
    }
    lineStart(msg);
    process.stderr.write(msg);
  }));
}

function injectHMR(options) {
  var webpackConfig = options.webpackConfig;
  var entries = webpackConfig.entry;
  if (typeof entries === 'string') {
    entries = [entries];
  }
  var protocol = options.https ? 'https' : 'http';
  var url = protocol + '://127.0.0.1:' + options.serverPort;
  var hotMiddleWarePath = _path2.default.join(__dirname, '../node_modules/webpack-hot-middleware');
  var hotScripts = [hotMiddleWarePath + '/client?reload=true&path=' + url + '/__webpack_hmr'];
  if (_lodash2.default.isPlainObject(entries)) {
    (0, _keys2.default)(entries).forEach(function (key) {
      var value = entries[key];
      if (!Array.isArray(value)) {
        if (typeof value === 'string') {
          value = [value];
        } else {
          value = [];
        }
      }
      entries[key] = value.concat(hotScripts);
    });
  } else if (Array.isArray(entries)) {
    entries = entries.concat(hotScripts);
  }
  webpackConfig.entry = entries;
  webpackConfig.plugins = webpackConfig.plugins.concat(new _webpack2.default.HotModuleReplacementPlugin());
}

module.exports = exports['default'];