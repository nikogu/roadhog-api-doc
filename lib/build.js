const program = require("commander");
const path = require("path");
const fs = require("fs-extra");
const cwd = process.cwd();
const chalk = require("chalk");
const shelljs = require("shelljs");
const isWindows = require("is-windows");

const isWin = isWindows();

module.exports = function(args, callback) {
  const port = args[3] || "";
  let isStatic = false;
  if (!/\d/.test(port)) {
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

  // 3. 建立变量文件
  const configContent = `export default {
  port: "${port}",
  isStatic: ${isStatic},
}
`;

  fs.writeFileSync(
    path.join(tempDir, "./src/config.js"),
    configContent,
    "utf-8"
  );

  // 4. package.json
  const pkg = () => `{
  "name": "roadhog-api-doc-boilerplate",
  "private": true,
  "scripts": {
    "build": "${
      isWin ? `node ./win-build.js` : `./node_modules/.bin/roadhog build`
    }"
  },
  "dependencies": {},
  "devDependencies": {}
}`;

  fs.writeFileSync(path.join(tempDir, "./package.json"), pkg(), "utf-8");

  // 4. 启动 roadhog
  process.chdir("_roadhog-api-doc");
  shelljs.ln("-sf", "../node_modules", "node_modules");
  shelljs.exec("npm run build", function(code, stdout, stderr) {
    fs.removeSync(path.join(tempDir, "./dist/index.html"));
    fs.copySync(path.join(tempDir, "./dist/"), path.join(cwd, "./dist/"), {
      overwrite: true
    });
    fs.removeSync(tempDir);

    if (stderr && stderr.replace(/\s/gi, "") != "null") {
      console.log(chalk.red("roadhog api doc build failed."));
    } else {
      console.log(chalk.green("roadhog api doc build success."));
    }

    callback && callback();
  });
};
