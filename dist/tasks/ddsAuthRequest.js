'use strict';

/**
 * Send IdAuthHello request to DDS when connected.
 */

const dds = require('@dendra-science/goes-dds-client');

module.exports = {
  guard(m) {
    return !m.ddsAuthRequestError && m.private.ddsClient && m.private.ddsClient.isConnected && !m.ddsAuthResponse;
  },

  execute(m, { logger }) {
    const cfg = m.$app.get('clients').dds;
    const client = m.private.ddsClient;

    logger.info('DDS client authenticating');

    return client.request(dds.types.IdAuthHello, cfg.auth).then(res => {
      return res.data();
    }).then(data => {
      const d = data[0];
      if (d && d.serverCode) throw new Error(`Server error (${d.serverCode}): ${d.explanation}`);

      return data;
    }).catch(err => {
      logger.error('DDS client auth error', err);
      throw err;
    });
  },

  assign(m, res, { logger }) {
    m.ddsAuthResponse = res;

    logger.info('DDS client authenticated', res);
  }
};