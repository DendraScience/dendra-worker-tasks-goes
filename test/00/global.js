const chai = require('chai')
const feathers = require('feathers')
const restClient = require('feathers-rest/client')
const request = require('request')
const app = feathers()

const tm = require('@dendra-science/task-machine')
tm.configure({
  logger: console
})

const JSON_ARCHIVE_API_URL = 'http://localhost:8080/_services/archive/json/api/v1'
const NOAA_GOES_API_URL = 'http://localhost:8080/_services/noaa/goes/api/v1'

app.set('connections', {
  jsonArchive: {
    app: feathers().configure(restClient(JSON_ARCHIVE_API_URL).request(request))
  },
  noaaGOES: {
    app: feathers().configure(restClient(NOAA_GOES_API_URL).request(request))
  }
})

app.set('apis', {
  influxDB: {
    url: 'http://localhost:8086'
  }
})

global.assert = chai.assert
global.expect = chai.expect
global.main = {
  app
}
global.tm = tm
