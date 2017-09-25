const request = require('request')

export default {
  guard (m) {
    return !m.loadError && !m.loadReady &&
      m.scratch.extractedData && (m.transformIndex === m.scratch.extractedData.length) &&
      m.scratch.transformBuf && (m.scratch.transformBuf.length > 0) &&
      m.databaseReady
  },
  execute (m) {
    const requestOpts = {
      body: m.scratch.transformBuf,
      method: 'POST',
      qs: {
        db: m.source.load.database,
        precision: 'ms'
      },
      url: `${m.scratch.influxDB.url}/write`
    }

    return new Promise((resolve, reject) => {
      request(requestOpts, (err, response) => err ? reject(err) : resolve(response))
    }).then(response => {
      if (response.statusCode !== 204) throw new Error(`Non-success status code ${response.statusCode}`)

      return true
    })
  }
}
