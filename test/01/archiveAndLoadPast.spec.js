/**
 * Tests for archiveAndLoadPast tasks
 */

const util = require('util')

describe('archiveAndLoadPast tasks', function () {
  this.timeout(60000)

  const now = new Date()
  const model = {
    $app: main.app,
    key: 'archiveAndLoadPast',
    private: {},
    props: {},
    state: {
      _id: 'taskMachine-archiveAndLoadPast-current',
      sources: [{
        address: 'BEC01EF8',
        description: 'Granites',
        query: {
          decode_columns: '', // Decode with default column names
          decode_format: 'fp2_27',
          decode_slice: '1,487'
        },
        transform: {
          time_edit: 'so_h',
          time_interval: 600
        },
        load: {
          database: 'station_granites',
          measurement: 'logger_data'
        }
      }],
      created_at: now,
      updated_at: now
    }
  }

  let tasks
  let machine

  it('should import', function () {
    tasks = require('../../dist').archiveAndLoadPast

    expect(tasks).to.have.property('bounds')
  })

  it('should create machine', function () {
    machine = new tm.TaskMachine(model, tasks, {
      interval: -1
    })

    expect(machine).to.have.property('model')
  })

  it('should run for BEC01EF8', function () {
    model.scratch = {}

    return machine.clear().start().then(success => {
      expect(success).to.be.true

      expect(machine.model).to.have.property('boundsReady', true)
      expect(machine.model).to.have.property('sourceReady', true)
      expect(machine.model).to.have.property('setupReady', true)
      expect(machine.model).to.have.property('selectReady', true)
      expect(machine.model).to.have.property('checkReady', true)
      expect(machine.model).to.have.property('extractReady', true)
      expect(machine.model).to.have.property('archiveReady', true)
      expect(machine.model).to.have.property('transformReady', true)
      expect(machine.model).to.have.property('databaseReady', true)
      expect(machine.model).to.have.property('loadReady', true)
      expect(machine.model).to.have.nested.property('source.address', 'BEC01EF8')
      expect(machine.model).to.have.nested.property('state.source_index', 0)
    })
  })
})
