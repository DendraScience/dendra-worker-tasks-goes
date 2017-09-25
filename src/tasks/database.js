const request = require('request')

export default {
  guard (m) {
    return !m.databaseError && !m.databaseReady &&
      m.setupReady
  },
  execute (m) {
    const requestOpts = {
      method: 'POST',
      qs: {
        q: `CREATE DATABASE "${m.source.load.database}"`
      },
      url: `${m.scratch.influxDB.url}/query`
    }

    return new Promise((resolve, reject) => {
      request(requestOpts, (err, response) => err ? reject(err) : resolve(response))
    }).then(response => {
      if (response.statusCode !== 200) throw new Error(`Non-success status code ${response.statusCode}`)

      return true
    })
  }
}
