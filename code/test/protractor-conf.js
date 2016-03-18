exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  chromeOnly: true,

  baseUrl: 'http://localhost:9000/',

  framework: 'jasmine',

  mochaNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
