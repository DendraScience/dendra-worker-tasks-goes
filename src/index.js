/**
 * Worker tasks for importing GOES data.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module dendra-worker-tasks-goes
 */

// Named exports for convenience
module.exports = {
  importPast: require('./importPast'),
  importRecent: require('./importRecent')
}
