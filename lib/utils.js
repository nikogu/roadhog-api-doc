const format = function (mockData, origin) {
  if (origin) {
    mockData.__mockData = origin;
  }
  Object.keys(mockData).forEach((key) => {
    if (mockData[key].$body) {
      mockData[key] = mockData[key].$body;
    }
  });
  return mockData;
}

const delay = function (proxy, timer) {
  const mockApi = {};
  Object.keys(proxy).forEach(key => {
    mockApi[key] = (req, res) => {

      const result = proxy[key].$body || proxy[key];

      let func;
      if (Object.prototype.toString.call(result) === '[object Function]') {
        func = result;
      } else {
        func = (req, res) => {
          res.json(result);
        }
      }

      setTimeout(() => {
        func(req, res);
      }, timer);
    }
  });
  mockApi.__mockData = proxy;
  return mockApi;
}

module.exports = {
  delay,
  format,
};
