'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _archivePast = require('./archivePast');

Object.defineProperty(exports, 'archivePast', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_archivePast).default;
  }
});

var _archiveRecent = require('./archiveRecent');

Object.defineProperty(exports, 'archiveRecent', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_archiveRecent).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }