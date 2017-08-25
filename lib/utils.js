var format = function (mockData, origin) {
  if (origin) {
    mockData.__mockData = origin;
  }
  Object.keys(mockData).forEach(function (key) {
    if (mockData[key].$body) {
      mockData[key] = mockData[key].$body;
    }
  });
  return mockData;
}

var delay = function (proxy, timer) {
  var mockApi = {};
  Object.keys(proxy).forEach(function (key) {
    mockApi[key] = function (req, res) {

      var result = proxy[key].$body || proxy[key];

      var foo;
      if (Object.prototype.toString.call(result) === '[object Function]') {
        foo = result;
      } else {
        foo = function (req, res) {
          res.json(result);
        }
      }

      setTimeout(function () {
        foo(req, res);
      }, timer);
    }
  });
  mockApi.__mockData = proxy;
  return mockApi;
}

module.exports.delay = delay;
module.exports.format = format;
