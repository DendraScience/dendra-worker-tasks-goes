'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const moment = require('moment');

exports.default = {
  init: {
    clear(m) {
      m.bounds = null;
      m.source = null;
    },
    guard(m) {
      const elapsed = m.machineStartedAt - m.machineStoppedAt;
      const throttle = (m.state.throttle_seconds || 600) * 1000;

      return !m.bounds && (elapsed < 0 || elapsed > throttle) && m.state.sources && m.state.sources.length > 0;
    },
    execute() {
      return true;
    },
    assign(m) {
      const index = m.state.source_index | 0;
      const source = m.state.sources[index];

      m.bounds = {
        start: moment(m.machineStartedAt).utc().startOf('d').subtract(1, 'd'),
        end: moment(m.machineStartedAt).utc().startOf('h').subtract(1, 'h')
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
      m.selectedDate = m.source.extract_date ? moment.max(start, moment(m.source.extract_date).utc().startOf('h')) : start;
    }
  },

  check: {
    clear(m) {
      m.extractDate = null;
    },
    guard(m) {
      return !m.extractDate && m.selectedDate && m.selectedDate < m.bounds.end;
    },
    execute() {
      return true;
    },
    assign(m, res) {
      m.extractDate = m.selectedDate;
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
          drs_until: m.extractDate.clone().add(24, 'h').toDate(),
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
      if (++m.archiveIndex >= m.extractedData.length) {
        const message = m.extractedData[0].message;
        const messageDate = moment(message.header.timeDate).utc();

        m.source.extract_date = messageDate.clone().startOf('h').add(1, 'h').toDate();
      }
    }
  }
};