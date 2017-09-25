/**
 * Worker tasks for extracting and archiving GOES data.
 *
 * @author J. Scott Smith
 * @license BSD-2-Clause-FreeBSD
 * @module dendra-worker-tasks-goes
 */

// Named exports for convenience
export { default as archiveAndLoadPast } from './archiveAndLoadPast'
export { default as archiveAndLoadRecent } from './archiveAndLoadRecent'
export { default as archivePast } from './archivePast'
export { default as archiveRecent } from './archiveRecent'
