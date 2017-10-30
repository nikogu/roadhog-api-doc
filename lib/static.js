const fs = require('fs-extra');
const shelljs = require('shelljs');
const chalk = require('chalk');

const cwd = process.cwd();

module.exports = function () {
  const utilsDir = `${cwd}/src/utils`;
  const tpl = `import query from '../.roadhogrc.mock.js';

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
      const _req = {
        url,
        params: params.body,
        query: params.body,
        body: params.body,
      };
      const _res = {
        json: (data) => {
          resolve(data);
        },
        send: (data) => {
          resolve(data);
        },
      };
      res(_req, _res);
    } else {
      resolve(res);
    }
  });
}
`;

  const clean = function () {
    fs.copySync(`${utilsDir}/request-temp.js`, `${utilsDir}/request.js`);
    fs.removeSync(`${utilsDir}/request-temp.js`);
    fs.removeSync(`${cwd}/src/.roadhogrc.mock.js`);
    fs.removeSync(`${cwd}/src/mock`);
  }

  process.on('exit', function () {
    try {
      clean();
    } catch(e) {}
  });

  process.on('SIGINT', function () {
    try {
      clean();
    } catch(e) {}

    if (program.runningCommand) {
      program.runningCommand.kill('SIGKILL');
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
    fs.writeFileSync(`${utilsDir}/request.js`, tpl, 'utf8');

    // 5. check CNAME
    const hasCNAME = fs.existsSync(`${cwd}/CNAME`);
    const shellStr = hasCNAME ? 'npm run build && cp CNAME dist && ./node_modules/.bin/gh-pages -d dist'
      : 'npm run build && ./node_modules/.bin/gh-pages -d dist';

    // 6. npm run build && gh-pages -d dist
    console.log(chalk.green('building...'));
    shelljs.exec(shellStr, function (code, stdout, stderr) {
      try {
        clean();
      } catch(e) {}
      console.log('build static success');
    });

  } catch (e) {
    throw new Error(e);
  }
};
