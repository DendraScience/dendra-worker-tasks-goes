'use strict';

module.exports = {
  bookmark: require('./tasks/recent/bookmark'),
  bounds: require('./tasks/recent/bounds'),
  criteriaDates: require('./tasks/recent/criteriaDates'),
  dcpBlockRequest: require('./tasks/dcpBlockRequest'),
  ddsAuthRequest: require('./tasks/ddsAuthRequest'),
  ddsClient: require('./tasks/ddsClient'),
  ddsConnect: require('./tasks/ddsConnect'),
  ddsCriteria: require('./tasks/ddsCriteria'),
  ddsCriteriaRequest: require('./tasks/ddsCriteriaRequest'),
  healthCheck: require('./tasks/healthCheck'),
  publish: require('./tasks/publish'),
  source: require('./tasks/source'),
  sources: require('./tasks/sources'),
  stan: require('./tasks/stan'),
  stanCheck: require('./tasks/stanCheck'),
  versionTs: require('./tasks/versionTs')
};