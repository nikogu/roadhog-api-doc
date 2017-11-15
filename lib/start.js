const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();
const chalk = require('chalk');
const exec = require('child_process').exec;
const portfinder = require('portfinder');
const isWindows = require('is-windows');

module.exports = function (args) {

  const port = args[3] || '';
  let isStatic = false;
  if (!/\d/.test(port)) {
    isStatic = true;
  }

  const configFilePath = path.join(cwd, './.roadhogrc.mock.js');
  let noFile = false;

  try {
    const result = fs.readFileSync(configFilePath);
    if (!result) {
      noFile = true;
    }
  } catch (e) {
    noFile = true;
  }
  if (noFile) {
    console.log(chalk.red('There is no `.roadhogrc.mock.js` file.'));
    return;
  }

  // 1. 创建临时文件夹
  const tempDir = path.join(cwd, './_roadhog-api-doc');
  const boilerplateDir = path.join(__dirname, '../boilerplate');

  process.on('exit', function () {
  });

  process.on('SIGINT', function () {

    fs.removeSync(tempDir);

    program.runningCommand && program.runningCommand.kill('SIGKILL');
    process.exit(0);
  });

  fs.ensureDirSync(tempDir);

  // 2. 移动模板到当前目录
  fs.copySync(boilerplateDir, tempDir, { overwrite: true });

  // 3. 建立变量文件
  const configContent = `
  export default {
    port: "${port}",
    isStatic: ${isStatic},
  }
  `;

  // 4. package.json
  const pkg = (port) => `{
  "name": "roadhog-api-doc-boilerplate",
  "private": true,
  "scripts": {
    "start": "${isWindows() ? `node ./win-start.js` : `PORT=${port} ../node_modules/.bin/roadhog server`}",
    "build": "${isWindows() ? `node ./win-build.js` : `../node_modules/.bin/roadhog build`}"
  },
  "dependencies": {},
  "devDependencies": {}
}`;

  fs.writeFileSync(path.join(tempDir, './src/config.js'), configContent, 'utf-8');

  portfinder.getPort(function (err, port) {

    fs.writeFileSync(path.join(tempDir, './package.json'), pkg(port), 'utf-8');

    // 5. 启动 roadhog
    exec('cd _roadhog-api-doc && npm start', function (err, stdout, stderr) {
      if (err) {
        throw new Error(err);
      } else {
        console.log(stdout);
      }
    });
  });
};
