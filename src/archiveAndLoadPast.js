const moment = require('moment')
const request = require('request')

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
        start: m.now.clone().startOf('d').subtract(30, 'd'),
        end: m.now.clone().startOf('d').subtract(1, 'd')
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
      m.selectedDate = m.source.extract_date ? moment.max(start, moment(m.source.extract_date).utc().startOf('d')) : start
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
    execute (m) {
      const checks = []
      const address = m.source.address.toLowerCase()
      const startTime = m.selectedDate.format('YYYY-MM-DD')
      const endTime = m.selectedDate.clone().add(1, 'd').format('YYYY-MM-DD')

      /*
        Look for documents in the JSON archive.
       */
      const documentService = m.$app.get('connections').jsonArchive.app.service('/documents')
      const categoryId = `goes-${address}-${startTime}`

      const checkArchive = documentService.find({query: {
        category_id: categoryId,
        $limit: 2000
      }}).then(res => {
        return (res.data && res.data.length) || 0
      })
      checks.push(checkArchive)

      /*
        Optionally look for points in InfluxDB.
       */
      if (m.source.load && m.source.load.database) {
        const requestOpts = {
          method: 'POST',
          qs: {
            db: m.source.load.database,
            q: `SELECT COUNT("start_time") FROM "message_info" WHERE "address" = '${address}' AND time >= '${startTime}' AND time < '${endTime}'`
          },
          url: `${m.scratch.influxDB.url}/query`
        }

        const influxCheck = new Promise((resolve, reject) => {
          request(requestOpts, (err, response) => err ? reject(err) : resolve(response))
        }).then(response => {
          if (response.statusCode !== 200) throw new Error(`Non-success status code ${response.statusCode}`)

          return JSON.parse(response.body)
        }).then(body => {
          try {
            return body.results[0].series[0].values[0][1]
          } catch (e) {
            return 0
          }
        })
        checks.push(influxCheck)
      }

      return Promise.all(checks)
    },
    assign (m, res) {
      m.source.extract_date = m.selectedDate.clone().add(1, 'd').toDate()

      // Ensure there are 24 messages archived and loaded for the selected date
      // TODO: Make configurable
      if (res.every(e => e === 24)) {
        m.selectedDate = null
      } else {
        m.extractDate = m.selectedDate
      }
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
        drs_until: m.extractDate.clone().add(1, 'd').toDate(),
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
  load: require('./tasks/load').default
}
