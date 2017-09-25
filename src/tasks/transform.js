const moment = require('moment')

/*
  InfluxDB Line Protocol is used for loading points.

  SEE: https://docs.influxdata.com/influxdb/v1.3/write_protocols/line_protocol_reference/#line-protocol
 */

export default {
  clear (m) {
    m.transformIndex = 0
  },
  guard (m) {
    return !m.transformError &&
      m.scratch.extractedData && (m.transformIndex < m.scratch.extractedData.length) &&
      m.scratch.extractedData[m.transformIndex].decoded &&
      (typeof m.scratch.extractedData[m.transformIndex].decoded[0] === 'object') &&
      !Array.isArray(m.scratch.extractedData[m.transformIndex].decoded[0])
  },
  execute (m) {
    const content = m.scratch.extractedData[m.transformIndex]
    const message = content.message
    const header = message.header
    const address = header.address.toLowerCase()
    const messageDate = moment(header.timeDate).utc()
    const startTime = m.scratch.timeEditor.edit(messageDate).valueOf()

    let time = startTime
    let endTime
    let totalLength = 0

    /*
      Concat a buffer containing Line Protocol strings.
     */

    // Map decoded row objects to points
    const bufs = content.decoded.map(row => {
      // Allow for static fields to be specified for every point
      if (m.source.load.fields) row = Object.assign({}, m.source.load.fields, row)
      const fieldSet = Object.keys(row).filter(key => {
        return typeof row[key] === 'number'
      }).map(key => {
        return `${key}=${row[key]}`
      }).join(',')
      const buf = Buffer.from(`${m.scratch.measurementTagSet} ${fieldSet} ${time}\n`)

      // Messages are always in descending order
      endTime = time
      time -= m.scratch.timeInterval * 1000

      totalLength += buf.length
      return buf
    })

    // Append a point for the message info
    const info = {
      channel_number: header.channelNumber,
      data_quality_indicator: header.dataQualityIndicator,
      length: header.length,
      signal_strength: header.signalStrength,
      start_time: startTime,
      end_time: endTime
    }
    const infoFieldSet = Object.keys(info).filter(key => {
      return (typeof info[key] === 'number') || (typeof info[key] === 'string')
    }).map(key => {
      return typeof info[key] === 'string' ? `${key}="${info[key]}"` : `${key}=${info[key]}`
    }).join(',')
    const headerBuf = Buffer.from(`message_info,address=${address} ${infoFieldSet} ${messageDate.valueOf()}\n`)

    bufs.push(headerBuf)
    totalLength += headerBuf.length

    return Buffer.concat(bufs, totalLength)
  },
  assign (m, res) {
    m.scratch.transformBuf = m.scratch.transformBuf ? Buffer.concat([
      m.scratch.transformBuf,
      res
    ], m.scratch.transformBuf.length + res.length) : res

    m.transformIndex++
  }
}
