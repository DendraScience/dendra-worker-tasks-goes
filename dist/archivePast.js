'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const moment = require('moment');

exports.default = {
  init: {
    clear(m) {
      m.now = m.bounds = m.source = null;
    },
    guard(m) {
      return !m.now && m.state.sources && m.state.sources.length > 0;
    },
    execute() {
      return true;
    },
    assign(m) {
      const index = m.state.source_index | 0;
      const source = m.state.sources[index];

      m.now = moment().utc();
      m.bounds = {
        start: m.now.clone().startOf('d').subtract(30, 'd'),
        end: m.now.clone().startOf('d').subtract(1, 'd')
      };
      m.source = source;
      m.state.source_index = (index + 1) % m.state.sources.length;
    }
  },

  select: {
    clear(m) {
      m.selectedDate = null;
    },
    guard(m) {
      return !m.selectedDate && m.source;
    },
    execute() {
      return true;
    },
    assign(m) {
      const start = m.bounds.start.clone();
      m.selectedDate = m.source.extract_date ? moment.max(start, moment(m.source.extract_date).utc().startOf('d')) : start;
    }
  },

  check: {
    clear(m) {
      m.extractDate = null;
    },
    guard(m) {
      return !m.checkError && !m.extractDate && m.selectedDate && m.selectedDate < m.bounds.end;
    },
    execute(m) {
      const documentService = m.$app.get('connections').jsonArchive.app.service('/documents');
      const categoryId = `goes-${m.source.address}-${m.selectedDate.format('YYYY-MM-DD')}`;

      return documentService.find({ query: {
          category_id: categoryId,
          $limit: 2000
        } });
    },
    afterExecute(m, res) {
      return res.data;
    },
    assign(m, res) {
      m.source.extract_date = m.selectedDate.clone().add(1, 'd').toDate();

      if (res.length === 24) {
        m.selectedDate = null;
      } else {
        m.extractDate = m.selectedDate;
      }
    }
  },

  extract: {
    clear(m) {
      m.extractedData = null;
    },
    guard(m) {
      return !m.extractError && !m.extractedData && m.extractDate;
    },
    execute(m) {
      const messageService = m.$app.get('connections').noaaGOES.app.service('/messages');

      return messageService.find({ query: {
          dcp_address: m.source.address,
          drs_since: m.extractDate.toDate(),
          drs_until: m.extractDate.clone().add(1, 'd').toDate(),
          body_encoding: 'hex',
          $limit: 2000
        } });
    },
    afterExecute(m, res) {
      if (res.data && res.data.length > 0) return res.data;
    },
    assign(m, res) {
      m.extractedData = res;
    }
  },

  archive: {
    clear(m) {
      m.archiveIndex = 0;
    },
    guard(m) {
      return !m.archiveError && m.extractedData && m.archiveIndex < m.extractedData.length;
    },
    execute(m) {
      const documentService = m.$app.get('connections').jsonArchive.app.service('/documents');
      const content = m.extractedData[m.archiveIndex];
      const message = content.message;
      const messageDate = moment(message.header.timeDate).utc();

      return documentService.create({
        _id: `goes-${message.header.address}-${messageDate.format('YYYY-MM-DD-HH')}`,
        content: content
      });
    },
    assign(m) {
      m.archiveIndex++;
    }
  }
};