/**
 * Publish DCP messages to NATS, also keep track of the last message timestamp.
 */

const moment = require('moment')

async function processItem (
  {context, domsatSeq, logger, message, pubSubject, stan}) {
  try {
    /*
      Prepare outbound message and publish.
     */

    const msgStr = JSON.stringify({
      context: Object.assign({}, context, {
        imported_at: new Date()
      }),
      payload: message // DOMSAT header and DCP msg body
    })

    const guid = await new Promise((resolve, reject) => {
      stan.publish(pubSubject, msgStr, (err, guid) => err ? reject(err) : resolve(guid))
    })

    logger.info('Published', {domsatSeq, pubSubject, guid})
  } catch (err) {
    logger.error('Processing error', {domsatSeq, err, message})
  }
}

module.exports = {
  clear (m) {
    delete m.lastMessageTs
  },

  guard (m) {
    return !m.publishError &&
      m.private.stan && m.stanConnected &&
      m.dcpBlockResponse && (m.dcpBlockResponse.length > 0)
  },

  async execute (m, {logger}) {
    const {source} = m
    const {stan} = m.private
    const {
      context,
      pub_to_subject: pubSubject
    } = source

    let lastMessageTs = moment(0).utc()

    while (m.dcpBlockResponse.length > 0) {
      const dcpMsg = m.dcpBlockResponse.pop() // Get a DCP msg block
      const {domsatSeq, message} = dcpMsg
      const {header} = message

      await processItem({context, domsatSeq, logger, message, pubSubject, stan})

      if (header) {
        const messageTs = moment(header.timeDate).utc()
        if (messageTs.isValid()) lastMessageTs = moment.max(lastMessageTs, messageTs)
      }
    }

    return lastMessageTs
  },

  assign (m, res) {
    m.healthCheckTs = new Date()
    m.lastMessageTs = res.toDate()
  }
}
