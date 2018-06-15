export default {
  entry: "src/api.js",
  extraBabelPlugins: [
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: true
      }
    ]
  ],
  env: {
    development: {
      extraBabelPlugins: ["dva-hmr"]
    }
  },
  ignoreMomentLocale: true,
  publicPath: "/",
  disableDynamicImport: true,
  hash: false,
  extraBabelIncludes: ["../mock"]
};
