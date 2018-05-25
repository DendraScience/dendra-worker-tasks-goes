'use strict';

/**
 * Update state.bookmarks for current source.
 */

module.exports = {
  guard(m) {
    return !m.bookmarkError && !m.bookmarkReady && m.criteriaDates;
  },

  execute() {
    return true;
  },

  assign(m, res, { logger }) {
    let bookmark;

    if (m.state.bookmarks) {
      bookmark = m.state.bookmarks.find(bm => bm.key === m.sourceKey);
    } else {
      m.state.bookmarks = [];
    }

    if (!bookmark) {
      bookmark = { key: m.sourceKey };
      m.state.bookmarks.push(bookmark);
    }

    bookmark.value = m.criteriaDates.since.valueOf();

    logger.info('Bookmark assigned', bookmark);
  }
};