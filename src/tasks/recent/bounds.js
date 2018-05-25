/**
 * Determine and assign import bounds in model.
 */

const moment = require('moment')

module.exports = {
  clear (m) {
    delete m.bounds
    delete m.now
  },

  guard (m) {
    return !m.boundsError &&
      !m.bounds
  },

  execute () {
    const now = moment().utc()

    return {
      start: now.clone().startOf('d').subtract(1, 'd'),
      end: now.clone().startOf('d').add(1, 'd')
    }
  },

  assign (m, res, {logger}) {
    m.bounds = res

    logger.info('Bounds ready', res)
  }
}
