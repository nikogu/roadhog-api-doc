const fs = require("fs-extra");
const program = require("commander");
const shelljs = require("shelljs");
const chalk = require("chalk");
const build = require("./build");

const cwd = process.cwd();

module.exports = function() {
  const utilsDir = `${cwd}/src/utils`;
  const tpl = `import { notification } from 'antd';
import query from '../.roadhogrc.mock.js';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

export default function request(url, params = {}) {
  return new Promise((resolve) => {
    const keys = Object.keys(query);
    let u = url;
    if (params && params.method) {
      u = \`\${params.method} \${u}\`;
    } else {
      u = \`GET \${u}\`;
    }
    const currentKey = keys.filter(key => new RegExp(key).test(u))[0];
    const res = query[currentKey];

    if (typeof res === 'function') {
      const tempReq = {
        url,
        params: params.body,
        query: params.body,
        body: params.body,
      };
      const tempRes = {
        json: (data) => {
          resolve(data);
        },
        send: (data) => {
          resolve(data);
        },
        status: (code) => {
          const errortext = codeMessage[code];
          notification.error({
            message: \`请求错误 \${code}: \${url}\`,
            description: errortext,
          });
          return tempRes;
        },
      };
      res(tempReq, tempRes);
    } else {
      resolve(res);
    }
  });
}
`;

  const gaTpl = function(code) {
    return `<script>
  // Enable Google Analytics
  if (!location.port) {
    /* eslint-disable */
    (function (i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', '${code}', 'auto');
    ga('send', 'pageview');
    /* eslint-enable */
  }
  </script>
  `;
  };

  const clean = function() {
    fs.copySync(`${utilsDir}/request-temp.js`, `${utilsDir}/request.js`);
    fs.removeSync(`${utilsDir}/request-temp.js`);
    fs.removeSync(`${cwd}/src/.roadhogrc.mock.js`);
    fs.removeSync(`${cwd}/src/mock`);
  };

  process.on("exit", function() {
    try {
      clean();
    } catch (e) {}
  });

  process.on("SIGINT", function() {
    try {
      clean();
    } catch (e) {}

    if (program.runningCommand) {
      program.runningCommand.kill("SIGKILL");
    }
    process.exit(0);
  });

  try {
    // 1. move ./.roadhogrc.mock.js to ./src/.roadhogrc.mock.js
    fs.copySync(`${cwd}/.roadhogrc.mock.js`, `${cwd}/src/.roadhogrc.mock.js`);

    // 2. move ./mock to ./src/mock
    fs.copySync(`${cwd}/mock`, `${cwd}/src/mock`);

    // 3. save old request.js
    fs.copySync(`${utilsDir}/request.js`, `${utilsDir}/request-temp.js`);

    // 4. modifier ./src/utils/request.js
    fs.writeFileSync(`${utilsDir}/request.js`, tpl, "utf8");

    // 5. check CNAME
    const hasCNAME = fs.existsSync(`${cwd}/CNAME`);
    const shellStr = hasCNAME
      ? "npm run build && cp CNAME dist"
      : "npm run build";

    // 6. npm run build
    console.log(chalk.green("building..."));
    shelljs.exec(shellStr, function(code, stdout, stderr) {
      // 7. add GA
      try {
        const ga = fs.readJSONSync(`${cwd}/.ga`);
        if (ga) {
          const tpl = gaTpl(ga.code);
          let html = fs.readFileSync(`${cwd}/dist/index.html`, "utf8");
          html = html.replace("<body>", `<body>${tpl}`);
          fs.writeFileSync(`${cwd}/dist/index.html`, html, "utf8");
        }
      } catch (e) {
        throw new Error(e);
        console.log(chalk.red("fail to add GA"));
      }

      if (stderr) {
        clean();
        return;
      }

      // 8. roadhog-api-build
      build("", function() {
        // console.log(chalk.green('build api docs success'));
        clean();
      });

      // 9. gh-pages -d dist
      //shelljs.exec(`${cwd}/node_modules/.bin/gh-pages -d dist`, function (code, stdout, stderr) {
      //
      //  console.log(stdout);
      //
      //  if (stderr) {
      //    throw new Error(stderr);
      //  }
      //  try {
      //  } catch (e) {
      //  }
      //  console.log('publish static success');
      //});
    });
  } catch (e) {
    throw new Error(e);
  }
};
