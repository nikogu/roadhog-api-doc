import { notification } from "antd";
import fetch from "dva/fetch";
import { routerRedux } from "dva/router";
import store from "../index";
import query from "../.roadhogrc.mock.js";

const codeMessage = {
  200: "服务器成功返回请求的数据",
  201: "新建或修改数据成功。",
  202: "一个请求已经进入后台排队（异步任务）",
  204: "删除数据成功。",
  400: "发出的请求有错误，服务器没有进行新建或修改数据,的操作。",
  401: "用户没有权限（令牌、用户名、密码错误）。",
  403: "用户得到授权，但是访问是被禁止的。",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作",
  406: "请求的格式不可得。",
  410: "请求的资源被永久删除，且不会再得到的。",
  422: "当创建一个对象时，发生一个验证错误。",
  500: "服务器发生错误，请检查服务器",
  502: "网关错误",
  503: "服务不可用，服务器暂时过载或维护",
  504: "网关超时"
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

export default function request(url, params = {}) {
  return new Promise(resolve => {
    const keys = Object.keys(query);
    let u = url;
    if (params && params.method) {
      u = `${params.method} ${u}`;
    } else {
      u = `GET ${u}`;
    }
    const currentKey = keys.filter(key => new RegExp(key).test(u))[0];
    const res = query[currentKey];

    if (typeof res === "function") {
      const tempReq = {
        url,
        params: params.body,
        query: params.body,
        body: params.body
      };
      const tempRes = {
        json: data => {
          resolve(data);
        },
        send: data => {
          resolve(data);
        },
        status: code => {
          const errortext = codeMessage[code];
          notification.error({
            message: `请求错误 ${code}: ${url}`,
            description: errortext
          });
          return tempRes;
        }
      };
      res(tempReq, tempRes);
    } else if (res) {
      resolve(res);
    } else {
      requestReal(url, params).then(res1 => {
        resolve(res1);
      });
    }
  });

  function requestReal(url2, options) {
    const defaultOptions = {
      credentials: "include"
    };
    const newOptions = { ...defaultOptions, ...options };
    if (newOptions.method === "POST" || newOptions.method === "PUT") {
      const body = newOptions.body;
      if (!(body instanceof FormData)) {
        if (newOptions.contentType === "www") {
          newOptions.headers = {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            ...newOptions.headers
          };
          let queryParams = "";
          if (Object.prototype.toString.call(body) === "[object Object]") {
            queryParams = Object.keys(body)
              .map(key => {
                let val = body[key];
                if (val instanceof Object) {
                  val = JSON.stringify(val);
                }
                return `${key}=${val}`;
              })
              .join("&");
          }
          newOptions.body = queryParams;
        } else {
          newOptions.headers = {
            Accept: "application/json",
            "Content-Type": "application/json; charset=utf-8",
            ...newOptions.headers
          };
          newOptions.body = JSON.stringify(newOptions.body);
        }
      } else {
        // newOptions.body is FormData
        newOptions.headers = {
          Accept: "application/json",
          "Content-Type": "multipart/form-data; charset=utf-8",
          ...newOptions.headers
        };
      }
    }

    return fetch(url2, newOptions)
      .then(checkStatus)
      .then(response => {
        /**
         * https://davidwalsh.name/fetch
         *
         * clone() - Creates a clone of a Response object.
         * error() - Returns a new Response object associated with a network error.
         * redirect() - Creates a new response with a different URL.
         * arrayBuffer() - Returns a promise that resolves with an ArrayBuffer.
         * blob() - Returns a promise that resolves with a Blob.
         * formData() - Returns a promise that resolves with a FormData object.
         * json() - Returns a promise that resolves with a JSON object.
         * text() - Returns a promise that resolves with a USVString (text).
         */
        if (newOptions.blob) {
          return response.blob();
        }
        return response.json();
      })
      .catch(e => {
        const { dispatch } = store;
        const status = e.name;
        if (status === 401) {
          dispatch({
            type: "login/logout"
          });
          return;
        }
        if (status === 403) {
          dispatch(routerRedux.push("/exception/403"));
          return;
        }
        if (status <= 504 && status >= 500) {
          dispatch(routerRedux.push("/exception/500"));
          return;
        }
        if (status >= 404 && status < 422) {
          dispatch(routerRedux.push("/exception/404"));
        }
      });
  }
}
