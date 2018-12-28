/**
 * Connect to DDS if not connected, and after NATS is ready.
 */

module.exports = {
  guard (m) {
    return !m.ddsConnectError &&
      m.private.ddsClient && !m.private.ddsClient.isConnected &&
      m.private.stan && m.stanConnected
  },

  beforeExecute (m) {
    delete m.ddsAuthResponse
  },

  async execute (m, { logger }) {
    const client = m.private.ddsClient

    logger.info('DDS client connecting', {
      host: client.options.host,
      port: client.options.port
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      return await client.connect()
    } catch (err) {
      logger.error('DDS client connect error', err)
      throw err
    }
  },

  assign (m, res, { logger }) {
    delete m.healthCheckTs

    logger.info('DDS client connected')
  }
}
