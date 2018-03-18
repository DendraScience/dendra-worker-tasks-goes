'use strict';

/**
 * Publish DCP messages to NATS, also keep track of the last message timestamp.
 */

const moment = require('moment');

async function publish({ logger, m, message, domsatSeq, source, stan }) {
  const subject = source.pub_to_subject;

  logger.info('Publishing', { domsatSeq, subject });

  try {
    const msgStr = JSON.stringify({
      context: Object.assign({
        imported_at: new Date()
      }, source.context),
      payload: message // DOMSAT header and DCP msg body
    });
    const guid = await new Promise((resolve, reject) => {
      stan.publish(subject, msgStr, (err, guid) => err ? reject(err) : resolve(guid));
    });

    logger.info('Published', { domsatSeq, guid, subject });
  } catch (err) {
    logger.error('Publish error', { domsatSeq, err, subject });
  }
}

module.exports = {
  clear(m) {
    delete m.lastMessageTs;
  },

  guard(m) {
    return !m.publishError && m.private.stan && m.stanConnected && m.dcpBlockResponse && m.dcpBlockResponse.length > 0;
  },

  async execute(m, { logger }) {
    const { source } = m;
    const { stan } = m.private;

    let lastMessageTs = moment(0).utc();

    while (m.dcpBlockResponse.length > 0) {
      const dcpMsg = m.dcpBlockResponse.pop(); // Get a DCP msg block
      const { domsatSeq, message } = dcpMsg;
      const { header } = message;

      await publish({ logger, m, message, domsatSeq, source, stan });

      if (header) {
        const messageTs = moment(header.timeDate).utc();
        if (messageTs.isValid()) lastMessageTs = moment.max(lastMessageTs, messageTs);
      }
    }

    return lastMessageTs;
  },

  assign(m, res) {
    m.healthCheckTs = new Date();
    m.lastMessageTs = res.toDate();
  }
};