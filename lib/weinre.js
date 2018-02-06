'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xweinre = require('xweinre');

var _xweinre2 = _interopRequireDefault(_xweinre);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  inject: function inject(app) {
    app.use(_xweinre2.default.inject());
  }
};
module.exports = exports['default'];