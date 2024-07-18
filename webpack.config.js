const path = require("path");

module.exports = {
  mode: "none",
  entry: {
    main: "./src/index.js",
  },
  output: {
    filename: "index.js", // js文件输出目录
    path: path.resolve(__dirname, "./"), // 绝对路径 相对config/
    library: { type: "module" },
  },
  experiments: {
    outputModule: true,
  },
};
