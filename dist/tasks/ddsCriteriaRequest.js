'use strict';

/**
 * Send IdCriteria request to DDS after the auth request is sent.
 */

const dds = require('@dendra-science/goes-dds-client');

module.exports = {
  clear(m) {
    delete m.ddsCriteriaResponse;
  },

  guard(m) {
    return !m.ddsCriteriaRequestError && m.private.ddsClient && m.private.ddsClient.isConnected && !m.ddsCriteriaResponse && m.ddsCriteria && m.healthCheckReady;
  },

  execute(m, { logger }) {
    const client = m.private.ddsClient;

    logger.info('DDS client sending criteria');

    return client.request(dds.types.IdCriteria, m.ddsCriteria).then(res => {
      return res.data();
    }).then(data => {
      const d = data[0];
      if (d && d.serverCode) throw new Error(`Server error (${d.serverCode}): ${d.explanation}`);

      return data;
    }).catch(err => {
      logger.error('DDS client criteria error', err);
      throw err;
    });
  },

  assign(m, res, { logger }) {
    m.healthCheckTs = new Date();
    m.ddsCriteriaResponse = res;

    logger.info('DDS client sent criteria');
  }
};