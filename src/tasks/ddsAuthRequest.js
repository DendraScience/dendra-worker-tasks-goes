/**
 * Send IdAuthHello request to DDS when connected.
 */

const dds = require('@dendra-science/goes-dds-client')

module.exports = {
  guard (m) {
    return !m.ddsAuthRequestError &&
      m.private.ddsClient && m.private.ddsClient.isConnected &&
      !m.ddsAuthResponse
  },

  async execute (m, { logger }) {
    const cfg = Object.assign({
      auth: {}
    }, m.$app.get('clients').dds, m.props.dds)
    const client = m.private.ddsClient

    logger.info('DDS client authenticating')

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await client.request(dds.types.IdAuthHello, cfg.auth)
      const data = await res.data()
      const d = data[0]

      if (d && d.serverCode) throw new Error(`Server error (${d.serverCode}): ${d.explanation}`)

      return data
    } catch (err) {
      logger.error('DDS client auth error', err)
      throw err
    }
  },

  assign (m, res, { logger }) {
    m.ddsAuthResponse = res

    logger.info('DDS client authenticated', res)
  }
}
