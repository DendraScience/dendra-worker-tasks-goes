'use strict';

/**
 * Send IdDcpBlockExt request to DDS after the criteria request is sent.
 */

const dds = require('@dendra-science/goes-dds-client');

module.exports = {
  clear(m) {
    delete m.dcpBlockResponse;
  },

  guard(m) {
    return !m.dcpBlockRequestError && m.private.ddsClient && m.private.ddsClient.isConnected && !m.dcpBlockResponse && m.ddsCriteriaResponse;
  },

  async execute(m, { logger }) {
    const client = m.private.ddsClient;

    logger.info('DDS client sending block request');

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await client.request(dds.types.IdDcpBlockExt);
      const data = await res.data();
      const d = data[0];

      if (d && d.serverCode) throw new Error(`Server error (${d.serverCode}): ${d.explanation}`);

      return data;
    } catch (err) {
      logger.error('DDS client block request error', err);
      throw err;
    }
  },

  assign(m, res, { logger }) {
    m.dcpBlockResponse = res;

    logger.info('DDS client sent block request');
  }
};