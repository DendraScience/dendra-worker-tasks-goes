const chai = require('chai')
const feathers = require('feathers')
const app = feathers()

const tm = require('@dendra-science/task-machine')
tm.configure({
  // logger: console
})

app.logger = console

app.set('clients', {
  dds: {
    auth: {
      algorithm: 'sha256',
      password: process.env.DDS_PASS,
      username: process.env.DDS_USER
    },
    opts: {}
  },
  stan: {
    client: 'test-client',
    cluster: 'test-cluster',
    opts: {
      maxPubAcksInflight: 3,
      uri: 'http://localhost:4222'
    }
  }
})

global.assert = chai.assert
global.expect = chai.expect
global.main = {
  app
}
global.tm = tm
