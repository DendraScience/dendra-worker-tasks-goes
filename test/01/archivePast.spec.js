/**
 * Tests for archivePast tasks
 */

describe('archivePast tasks', function () {
  this.timeout(60000)

  const model = {
    $app: main.app,
    _id: 'archivePast',
    props: {},
    state: {
      _id: 'taskMachine-archivePast-current',
      sources: [{
        address: 'CD219642'
      }, {
        address: 'CD23A62C'
      }]
    }
  }

  let tasks
  let machine

  it('should import', function () {
    tasks = require('../../dist').archivePast

    expect(tasks).to.have.property('init')
  })

  it('should create machine', function () {
    machine = new tm.TaskMachine(model, tasks, {
      interval: -1
    })

    expect(machine).to.have.property('model')
  })

  it('should run for CD219642', function () {
    return machine.clear().start().then(success => {
      expect(success).to.be.true
      expect(machine.model).to.have.nested.property('initReady', true)
      expect(machine.model).to.have.nested.property('selectReady', true)
      expect(machine.model).to.have.nested.property('checkReady', true)
      expect(machine.model).to.have.nested.property('extractReady', true)
      expect(machine.model).to.have.nested.property('archiveReady', true)
      expect(machine.model).to.have.nested.property('source.address', 'CD219642')
      expect(machine.model).to.have.nested.property('state.source_index', 1)
    })
  })

  it('should run for CD23A62C', function () {
    return machine.clear().start().then(success => {
      expect(success).to.be.true
      expect(machine.model).to.have.nested.property('initReady', true)
      expect(machine.model).to.have.nested.property('selectReady', true)
      expect(machine.model).to.have.nested.property('checkReady', true)
      expect(machine.model).to.have.nested.property('extractReady', true)
      expect(machine.model).to.have.nested.property('archiveReady', true)
      expect(machine.model).to.have.nested.property('source.address', 'CD23A62C')
      expect(machine.model).to.have.nested.property('state.source_index', 0)
    })
  })
})
