/**
 * Determine and assign criteria dates after the bounds and source are ready.
 */

const moment = require('moment')

module.exports = {
  clear (m) {
    delete m.criteriaDates
  },

  guard (m) {
    return !m.criteriaDatesError &&
      !m.criteriaDates &&
      m.bounds && m.sourceKey
  },

  execute (m) {
    const start = m.bounds.start.clone()

    let since = start

    if (m.state.bookmarks) {
      const bookmark = m.state.bookmarks.find(bm => bm.key === m.sourceKey)

      if (bookmark) since = moment(bookmark.value).utc().startOf('d').add(1, 'd')
      if (!since.isBetween(m.bounds.start, m.bounds.end, null, '[)')) since = start
    }

    return {
      since,
      until: since.clone().add(1, 'd')
    }
  },

  assign (m, res, {logger}) {
    m.criteriaDates = res

    logger.info('Criteria dates ready', res)
  }
}
