export default {
  clear (m) {
    m.source = null
  },
  guard (m) {
    return !m.sourceError && !m.source &&
      m.state.sources && (m.state.sources.length > 0)
  },
  execute () { return true },
  assign (m) {
    const index = m.state.source_index | 0
    m.source = m.state.sources[index]
    m.state.source_index = (index + 1) % m.state.sources.length
  }
}
