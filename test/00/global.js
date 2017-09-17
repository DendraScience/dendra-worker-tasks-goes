const chai = require('chai')
const feathers = require('feathers')
const restClient = require('feathers-rest/client')
const request = require('request')
const app = feathers()

const tm = require('@dendra-science/task-machine')
tm.configure({
  logger: console
})

const JSON_ARCHIVE_API_URL = 'http://localhost:3033'
const NOAA_GOES_API_URL = 'http://128.32.109.75/_services/noaa/goes/api/v1'

app.set('connections', {
  jsonArchive: {
    app: feathers().configure(restClient(JSON_ARCHIVE_API_URL).request(request))
  },
  noaaGOES: {
    app: feathers().configure(restClient(NOAA_GOES_API_URL).request(request))
  }
})

global.assert = chai.assert
global.expect = chai.expect
global.main = {
  app
}
global.tm = tm
