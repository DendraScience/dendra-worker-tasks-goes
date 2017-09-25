const moment = require('moment')

export default {
  bounds: {
    clear (m) {
      m.now = m.bounds = null
    },
    guard (m) {
      return !m.boundsError && !m.bounds
    },
    execute () { return true },
    assign (m) {
      // Define the bounds of our extract time window
      m.now = moment().utc()
      m.bounds = {
        start: m.now.clone().startOf('d').subtract(1, 'd'),
        end: m.now.clone().startOf('h').subtract(1, 'h')
      }
    }
  },

  source: require('./tasks/source').default,
  setup: require('./tasks/setup').default,

  select: {
    clear (m) {
      m.selectedDate = null
    },
    guard (m) {
      return !m.selectError && !m.selectedDate &&
        m.bounds && m.source
    },
    execute () { return true },
    assign (m) {
      const start = m.bounds.start.clone()
      m.selectedDate = m.source.extract_date ? moment.max(start, moment(m.source.extract_date).utc().startOf('h')) : start
    }
  },

  check: {
    clear (m) {
      m.extractDate = null
    },
    guard (m) {
      return !m.checkError && !m.extractDate &&
        m.selectedDate && m.bounds && (m.selectedDate < m.bounds.end) &&
        m.setupReady
    },
    execute () { return true },
    assign (m, res) {
      m.extractDate = m.selectedDate
    }
  },

  extract: {
    guard (m) {
      return !m.extractError && !m.scratch.extractedData &&
        m.extractDate
    },
    execute (m) {
      const messageService = m.$app.get('connections').noaaGOES.app.service('/messages')
      const query = Object.assign({
        dcp_address: m.source.address,
        drs_since: m.extractDate.toDate(),
        drs_until: m.extractDate.clone().add(24, 'h').toDate(),
        body_encoding: 'hex',
        $limit: 2000
      }, m.source.query)

      return messageService.find({query: query})
    },
    afterExecute (m, res) {
      if (res.data && res.data.length > 0) return res.data
    },
    assign (m, res) {
      m.scratch.extractedData = res
    }
  },

  archive: require('./tasks/archive').default,
  transform: require('./tasks/transform').default,
  database: require('./tasks/database').default,
  load: require('./tasks/load').default,

  next: {
    guard (m) {
      return !m.nextError && !m.nextReady &&
        m.scratch.extractedData && (m.archiveIndex >= m.scratch.extractedData.length) &&
        m.loadReady
    },
    execute () { return true },
    assign (m) {
      const message = m.scratch.extractedData[0].message
      const header = message.header
      const messageDate = moment(header.timeDate).utc()

      m.source.extract_date = messageDate.clone().startOf('h').add(1, 'h').toDate()
    }
  }
}
