'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = function (proxySerever, request, response) {
  var method = request.method;
  var postParams = _querystring2.default.stringify(request.body);
  var originalUrl = request.originalUrl;

  var options = {
    host: proxySerever.host,
    port: proxySerever.port || 80,
    path: originalUrl,
    method: method,
    headers: {}
  };

  console.log('Remote request(' + method + '): http://' + proxySerever.host + ':' + (proxySerever.port || 80) + originalUrl);

  // cookie
  options.headers.cookie = proxySerever.cookie || '';
  // post
  if (method.toLowerCase() === 'post') {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = postParams.length;
  }

  // 发送线上的数据请求
  var req = _http2.default.request(options, function (res) {
    res.setEncoding('utf8');
    var str = '';
    res.on('data', function (d) {
      str += d;
    });
    res.on('end', function () {
      var data = void 0;
      try {
        data = JSON.parse(str);
      } catch (ex) {
        data = str;
      }
      console.log('Remote response: ' + (0, _stringify2.default)(data));
      response.json(data);
    });
    res.on('error', function (err) {
      console.log('Remote response error: ', (0, _stringify2.default)(err));
      response.end('Reponse error: ' + err.message);
    });
  });
  req.on('error', function (err) {
    console.log('Remote response error: ', (0, _stringify2.default)(err));
    response.end('Request error: ' + err.message);
  });
  req.write(postParams);
  req.end();
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }