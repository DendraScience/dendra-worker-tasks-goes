'use strict';

/**
 * Determine and assign criteria dates after the bounds and source are ready.
 */

const moment = require('moment');

module.exports = {
  clear(m) {
    delete m.criteriaDates;
  },

  guard(m) {
    return !m.criteriaDatesError && !m.criteriaDates && m.bounds && m.sourceKey;
  },

  async execute(m, { logger }) {
    const docId = `${m.key}-bookmarks`;
    let doc;

    try {
      doc = await m.$app.service('/state/docs').get(docId);
    } catch (err) {
      if (err.code === 404) {
        logger.info(`No state doc found for '${docId}'`);
      } else {
        logger.error('Get bookmarks error', err);
      }
    }

    const start = m.bounds.start.clone();
    let since = start;

    if (doc && doc.bookmarks) {
      const bookmark = doc.bookmarks.find(bm => bm.key === m.sourceKey);

      if (bookmark) since = moment(bookmark.value).utc().startOf('h').add(1, 'h');
      if (!since.isBetween(m.bounds.start, m.bounds.end, null, '[)')) since = start;
    }

    return {
      since,
      until: since.clone().add(24, 'h')
    };
  },

  assign(m, res, { logger }) {
    m.criteriaDates = res;

    logger.info('Criteria dates ready', res);
  }
};