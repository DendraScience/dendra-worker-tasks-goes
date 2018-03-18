'use strict';

/**
 * Create a DDS client if not defined. Add an event listener for errors.
 */

const dds = require('@dendra-science/goes-dds-client');

function handleError(err) {
  const { logger } = this;

  logger.error('DDS client error', err);
}

module.exports = {
  guard(m) {
    return !m.ddsClientError && !m.private.ddsClient;
  },

  execute(m) {
    const cfg = m.$app.get('clients').dds;

    return new dds.DDSClient(cfg.opts || {});
  },

  assign(m, res, { logger }) {
    res.on('error', handleError.bind({ logger }));

    m.private.ddsClient = res;

    logger.info('DDS client ready');
  }
};