/**
 * Prepare DDS criteria after the criteria dates and source are ready.
 */

const DATE_FORMAT = 'YYYY/DDDD HH:mm:ss'

module.exports = {
  clear (m) {
    delete m.ddsCriteria
  },

  guard (m) {
    return !m.ddsCriteriaError &&
      !m.ddsCriteria &&
      m.criteriaDates && m.source
  },

  execute (m) {
    return {
      DCP_ADDRESS: m.source.address,
      DRS_SINCE: m.criteriaDates.since.format(DATE_FORMAT),
      DRS_UNTIL: m.criteriaDates.until.format(DATE_FORMAT)
    }
  },

  assign (m, res, { logger }) {
    m.ddsCriteria = res

    logger.info('DDS criteria ready', res)
  }
}
