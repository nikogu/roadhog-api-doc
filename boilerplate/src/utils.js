import mock from '../../.roadhogrc.mock';

/* eslint no-underscore-dangle:0 */
const mockData = mock.__mockData || mock;

function isFunction(arg) {
  return Object.prototype.toString.call(arg) === '[object Function]';
}
function isObject(arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}

// 从 key 中获取 method 和 url
function parseKey(key) {
  const arr = key.split(' ');
  const method = arr[0];
  const url = arr[1];
  return {
    method,
    url,
  };
}

function getRequest(url) {
  return mockData[Object.keys(mockData).filter(key => key.indexOf(url) > -1)[0]];
}

function handleRequest(u, url, params, callback) {
  const r = getRequest(u);

  if (isFunction(r)) {
    const req = {
      url,
      params,
      query: params,
      body: params,
    };
    const res = {
      json: (data) => {
        callback(data.$body || data);
      },
      send: (data) => {
        callback(data.$body || data);
      },
    };
    r(req, res);
  } else {
    callback(r.$body || r);
  }
}

export default {
  isFunction,
  isObject,
  getRequest,
  parseKey,
  handleRequest,
};
