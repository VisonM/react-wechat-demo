const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/user', { target: 'http://localhost:8081/' }));
  app.use(proxy('/openapi', { target: 'http://www.tuling123.com/' }));

};
