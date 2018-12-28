/**
 * Tests for importPast tasks
 */

describe('importPast tasks', function () {
  this.timeout(180000)

  const now = new Date()
  const model = {
    props: {},
    state: {
      _id: 'taskMachine-importPast-current',
      health_check_threshold: 1200,
      source_defaults: {
        some_default: 'default'
      },
      sources: [
        {
          context: {
            org_slug: 'ucnrs',
            some_value: 'value',
            station: 'test_burns',
            table: 'TenMin'
          },
          address: 'BEC025B0',
          description: 'Burns',
          pub_to_subject: 'goes.importPast.out'
        },
        {
          context: {
            org_slug: 'ucnrs',
            some_value: 'value',
            station: 'test_chickering',
            table: 'TenMin'
          },
          address: 'BEC0035C',
          description: 'Chickering',
          pub_to_subject: 'goes.importPast.out'
        }
      ],
      created_at: now,
      updated_at: now
    }
  }

  Object.defineProperty(model, '$app', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: main.app
  })
  Object.defineProperty(model, 'key', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: 'importPast'
  })
  Object.defineProperty(model, 'private', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: {}
  })

  let tasks
  let machine

  let criteriaDatesBurns
  let criteriaDatesChickering

  after(function () {
    return Promise.all([
      model.private.ddsClient ? model.private.ddsClient.disconnect() : Promise.resolve(),

      model.private.stan ? new Promise((resolve, reject) => {
        model.private.stan.removeAllListeners()
        model.private.stan.once('close', resolve)
        model.private.stan.once('error', reject)
        model.private.stan.close()
      }) : Promise.resolve()
    ])
  })

  it('should import', function () {
    tasks = require('../../../dist').importPast

    expect(tasks).to.have.property('sources')
  })

  it('should create machine', function () {
    machine = new tm.TaskMachine(model, tasks, {
      helpers: {
        logger: console
      },
      interval: 500
    })

    expect(machine).to.have.property('model')
  })

  it('should import Burns 1st time', function () {
    model.scratch = {}

    return machine.clear().start().then(success => {
      /* eslint-disable-next-line no-unused-expressions */
      expect(success).to.be.true

      // Verify task state
      expect(model).to.have.property('boundsReady', true)
      expect(model).to.have.property('criteriaDatesReady', true)
      expect(model).to.have.property('dcpBlockRequestReady', true)
      expect(model).to.have.property('ddsAuthRequestReady', true)
      expect(model).to.have.property('ddsClientReady', true)
      expect(model).to.have.property('ddsConnectReady', true)
      expect(model).to.have.property('ddsCriteriaReady', true)
      expect(model).to.have.property('ddsCriteriaRequestReady', true)
      expect(model).to.have.property('healthCheckReady', true)
      expect(model).to.have.property('publishReady', true)
      expect(model).to.have.property('saveBookmarksReady', true)
      expect(model).to.have.property('sourceReady', true)
      expect(model).to.have.property('sourcesReady', true)
      expect(model).to.have.property('stanReady', true)
      expect(model).to.have.property('stanCheckReady', false)
      expect(model).to.have.property('versionTsReady', false)

      // Verify source
      expect(model).to.have.property('sourceKey', 'BEC025B0')

      // Check for defaults
      expect(model).to.have.nested.property('sources.BEC025B0.some_default', 'default')

      criteriaDatesBurns = model.criteriaDates
    })
  })

  it('should import Chickering 1st time', function () {
    model.scratch = {}

    return machine.clear().start().then(success => {
      /* eslint-disable-next-line no-unused-expressions */
      expect(success).to.be.true

      // Verify task state
      expect(model).to.have.property('boundsReady', true)
      expect(model).to.have.property('criteriaDatesReady', true)
      expect(model).to.have.property('dcpBlockRequestReady', true)
      expect(model).to.have.property('ddsAuthRequestReady', false)
      expect(model).to.have.property('ddsClientReady', false)
      expect(model).to.have.property('ddsConnectReady', false)
      expect(model).to.have.property('ddsCriteriaReady', true)
      expect(model).to.have.property('ddsCriteriaRequestReady', true)
      expect(model).to.have.property('healthCheckReady', true)
      expect(model).to.have.property('publishReady', true)
      expect(model).to.have.property('sourceReady', true)
      expect(model).to.have.property('sourcesReady', false)
      expect(model).to.have.property('saveBookmarksReady', true)
      expect(model).to.have.property('stanReady', false)
      expect(model).to.have.property('stanCheckReady', false)
      expect(model).to.have.property('versionTsReady', false)

      // Verify source
      expect(model).to.have.property('sourceKey', 'BEC0035C')

      // Check for defaults
      expect(model).to.have.nested.property('sources.BEC0035C.some_default', 'default')

      criteriaDatesChickering = model.criteriaDates
    })
  })

  it('should import Burns 2nd time', function () {
    model.scratch = {}

    return machine.clear().start().then(success => {
      /* eslint-disable-next-line no-unused-expressions */
      expect(success).to.be.true

      // Verify task state
      expect(model).to.have.property('boundsReady', true)
      expect(model).to.have.property('criteriaDatesReady', true)
      expect(model).to.have.property('dcpBlockRequestReady', true)
      expect(model).to.have.property('ddsAuthRequestReady', false)
      expect(model).to.have.property('ddsClientReady', false)
      expect(model).to.have.property('ddsConnectReady', false)
      expect(model).to.have.property('ddsCriteriaReady', true)
      expect(model).to.have.property('ddsCriteriaRequestReady', true)
      expect(model).to.have.property('healthCheckReady', true)
      expect(model).to.have.property('publishReady', true)
      expect(model).to.have.property('saveBookmarksReady', true)
      expect(model).to.have.property('sourceReady', true)
      expect(model).to.have.property('sourcesReady', false)
      expect(model).to.have.property('stanReady', false)
      expect(model).to.have.property('stanCheckReady', false)
      expect(model).to.have.property('versionTsReady', false)

      // Verify source
      expect(model).to.have.property('sourceKey', 'BEC025B0')

      // Verify criteria dates
      expect(model).to.have.nested.property('criteriaDates.since')
      expect(model).to.have.nested.property('criteriaDates.until')
      assert.equal(model.criteriaDates.since.valueOf(), criteriaDatesBurns.since.valueOf() + 24 * 60 * 60 * 1000)
      assert.equal(model.criteriaDates.until.valueOf(), criteriaDatesBurns.until.valueOf() + 24 * 60 * 60 * 1000)
    })
  })

  it('should import Chickering 2nd time', function () {
    model.scratch = {}

    return machine.clear().start().then(success => {
      /* eslint-disable-next-line no-unused-expressions */
      expect(success).to.be.true

      // Verify task state
      expect(model).to.have.property('boundsReady', true)
      expect(model).to.have.property('criteriaDatesReady', true)
      expect(model).to.have.property('dcpBlockRequestReady', true)
      expect(model).to.have.property('ddsAuthRequestReady', false)
      expect(model).to.have.property('ddsClientReady', false)
      expect(model).to.have.property('ddsConnectReady', false)
      expect(model).to.have.property('ddsCriteriaReady', true)
      expect(model).to.have.property('ddsCriteriaRequestReady', true)
      expect(model).to.have.property('healthCheckReady', true)
      expect(model).to.have.property('publishReady', true)
      expect(model).to.have.property('saveBookmarksReady', true)
      expect(model).to.have.property('sourceReady', true)
      expect(model).to.have.property('sourcesReady', false)
      expect(model).to.have.property('stanReady', false)
      expect(model).to.have.property('stanCheckReady', false)
      expect(model).to.have.property('versionTsReady', false)

      // Verify source
      expect(model).to.have.property('sourceKey', 'BEC0035C')

      // Verify criteria dates
      expect(model).to.have.nested.property('criteriaDates.since')
      expect(model).to.have.nested.property('criteriaDates.until')
      assert.equal(model.criteriaDates.since.valueOf(), criteriaDatesChickering.since.valueOf() + 24 * 60 * 60 * 1000)
      assert.equal(model.criteriaDates.until.valueOf(), criteriaDatesChickering.until.valueOf() + 24 * 60 * 60 * 1000)
    })
  })

  it('should get saved bookmarks', function () {
    return main.app.service('/state/docs').get('importPast-bookmarks').then(doc => {
      expect(doc).to.have.property('_id', 'importPast-bookmarks')
      expect(doc).to.have.nested.property('bookmarks.0.key', 'BEC025B0')
      expect(doc).to.have.nested.property('bookmarks.0.value').above(0)
    })
  })
})
