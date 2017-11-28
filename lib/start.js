const program = require("commander");
const path = require("path");
const fs = require("fs-extra");
const cwd = process.cwd();
const chalk = require("chalk");
const shelljs = require("shelljs");
const portfinder = require("portfinder");
const isWindows = require("is-windows");

const isWin = isWindows();

module.exports = function(args) {
  const projectServerPort = args[3] || "";
  let isStatic = false;
  if (!/\d/.test(projectServerPort)) {
    isStatic = true;
  }

  const configFilePath = path.join(cwd, "./.roadhogrc.mock.js");
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
    console.log(chalk.red("There is no `.roadhogrc.mock.js` file."));
    return;
  }

  // 1. 创建临时文件夹
  const tempDir = path.join(cwd, "./_roadhog-api-doc");
  const boilerplateDir = path.join(__dirname, "../boilerplate");

  process.on("exit", function() {});

  process.on("SIGINT", function() {
    fs.removeSync(tempDir);

    program.runningCommand && program.runningCommand.kill("SIGKILL");
    process.exit(0);
  });

  fs.ensureDirSync(tempDir);

  // 2. 移动模板到当前目录
  fs.copySync(boilerplateDir, tempDir, { overwrite: true });

  // 4. package.json
  const pkg = port => `{
  "name": "roadhog-api-doc-boilerplate",
  "private": true,
  "scripts": {
    "start": "${
      isWin
        ? `node ./win-start.js`
        : `PORT=${port} ./node_modules/.bin/roadhog server`
    }",
    "build": "${
      isWin ? `node ./win-build.js` : `./node_modules/.bin/roadhog build`
    }"
  },
  "dependencies": {},
  "devDependencies": {}
}`;

  portfinder.getPort(function(err, port) {
    fs.writeFileSync(path.join(tempDir, "./package.json"), pkg(port), "utf-8");

    // 3. 建立变量文件
    const configContent = `
  export default {
    port: "${projectServerPort}",
    docPort: "${port}",
    isStatic: ${isStatic},
  }
  `;

    fs.writeFileSync(
      path.join(tempDir, "./src/config.js"),
      configContent,
      "utf-8"
    );

    if (projectServerPort) {
      const mockjsContent = `
export default {
  'GET /api/*': 'http://localhost:${projectServerPort}/',
  'POST /api/*': 'http://localhost:${projectServerPort}/'
};
  `;
      fs.writeFileSync(
        path.join(tempDir, "./.roadhogrc.mock.js"),
        mockjsContent,
        "utf-8"
      );
    }

    // 5. 启动 roadhog
    process.chdir("_roadhog-api-doc");
    shelljs.ln("-sf", "../node_modules", "node_modules");
    shelljs.exec("npm start", function(code, stdout, stderr) {
      if (err) {
        throw new Error(err);
      } else {
        console.log(stdout);
      }
    });
  });
};
