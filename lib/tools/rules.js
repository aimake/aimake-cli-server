'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.default = rules;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable require-yield, consistent-return */

function rules(options) {
  return {
    beforeSendRequest: /*#__PURE__*/_regenerator2.default.mark(function beforeSendRequest(requestDetail) {
      var hostname, hosts, newRequestOptions;
      return _regenerator2.default.wrap(function beforeSendRequest$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              hostname = requestDetail.requestOptions.hostname;
              hosts = options.proxyServer.host;

              if (!(hosts.indexOf(hostname) !== -1)) {
                _context.next = 6;
                break;
              }

              newRequestOptions = requestDetail.requestOptions;

              newRequestOptions.hostname = '127.0.0.1';
              return _context.abrupt('return', {
                requestOptions: newRequestOptions
              });

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, beforeSendRequest, this);
    })
  };
}