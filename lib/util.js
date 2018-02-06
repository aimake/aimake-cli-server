'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _portscanner = require('portscanner');

var _portscanner2 = _interopRequireDefault(_portscanner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  findPort: function findPort(port, ipAddr) {
    return new _promise2.default(function (resolve, reject) {
      _portscanner2.default.findAPortNotInUse(port, port + 10, ipAddr, function (err, aPort) {
        if (err || !aPort) {
          reject();
        } else {
          resolve(aPort);
        }
      });
    });
  }
};
module.exports = exports['default'];