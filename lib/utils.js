const format = function(mockData, origin) {
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

module.exports = {
  format,
};
