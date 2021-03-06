/**
 * Send IdCriteria request to DDS after the auth request is sent.
 */

const dds = require('@dendra-science/goes-dds-client')

module.exports = {
  clear (m) {
    delete m.ddsCriteriaResponse
  },

  guard (m) {
    return !m.ddsCriteriaRequestError &&
      m.private.ddsClient && m.private.ddsClient.isConnected &&
      !m.ddsCriteriaResponse && m.ddsCriteria && m.healthCheckReady
  },

  async execute (m, { logger }) {
    const client = m.private.ddsClient

    logger.info('DDS client sending criteria')

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await client.request(dds.types.IdCriteria, m.ddsCriteria)
      const data = await res.data()
      const d = data[0]

      if (d && d.serverCode) throw new Error(`Server error (${d.serverCode}): ${d.explanation}`)

      return data
    } catch (err) {
      logger.error('DDS client criteria error', err)
      throw err
    }
  },

  assign (m, res, { logger }) {
    m.healthCheckTs = (new Date()).getTime()
    m.ddsCriteriaResponse = res

    logger.info('DDS client sent criteria')
  }
}
