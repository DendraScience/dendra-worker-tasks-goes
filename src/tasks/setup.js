const {MomentEditor} = require('@dendra-science/utils-moment')

export default {
  guard (m) {
    return !m.setupError && !m.setupReady &&
      m.source &&
      m.source.address &&
      m.source.transform && m.source.transform.time_edit &&
      m.source.load && m.source.load.database && m.source.load.measurement
  },
  execute () { return true },
  assign (m) {
    // Create a MomentEditor instance for deriving timestamps
    m.scratch.timeEditor = new MomentEditor(m.source.transform.time_edit)

    // Seconds elapsed between each decoded row
    m.scratch.timeInterval = m.source.transform.time_interval | 0

    // Concat the leftmost part of the Line Protocol string for loading
    const parts = [m.source.load.measurement]
    if (m.source.load.tags) {
      // Allow for static tags to be specified for every point
      Object.keys(m.source.load.tags).forEach(key => parts.push(`${key}=${m.source.load.tags[key]}`))
    }
    m.scratch.measurementTagSet = parts.join(',')
  }
}
