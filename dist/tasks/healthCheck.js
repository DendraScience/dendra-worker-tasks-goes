'use strict';

/**
 * Check for missing data, force a disconnect if detected.
 */

module.exports = {
  guard(m) {
    return !m.healthCheckError && !m.healthCheckReady && m.private.ddsClient && m.private.ddsClient.isConnected && m.ddsAuthResponse;
  },

  execute(m, { logger }) {
    const ts = new Date().getTime();
    const threshold = m.state.health_check_threshold;

    logger.info('Health check started');

    if (threshold && m.healthCheckTs && ts - m.healthCheckTs > threshold * 1000) {
      logger.error('Health check threshold exceeded');
      logger.info('DDS client disconnecting');

      return m.private.ddsClient.disconnect().catch(err => {
        logger.error('DDS client disconnect error', err);
        throw err;
      });
    }

    logger.info('Health check passed');

    return true;
  }
};