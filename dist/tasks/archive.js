'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const moment = require('moment');

exports.default = {
  clear(m) {
    m.archiveIndex = 0;
  },
  guard(m) {
    return !m.archiveError && m.scratch.extractedData && m.archiveIndex < m.scratch.extractedData.length;
  },
  execute(m) {
    const documentService = m.$app.get('connections').jsonArchive.app.service('/documents');
    const content = m.scratch.extractedData[m.archiveIndex];
    const message = content.message;
    const header = message.header;
    const address = header.address.toLowerCase();
    const messageDate = moment(header.timeDate).utc();

    return documentService.create({
      _id: `goes-${address}-${messageDate.format('YYYY-MM-DD-HH')}`,
      content: content
    });
  },
  assign(m) {
    m.archiveIndex++;
  }
};