const path = require("path");

module.exports = {
  devtool: "inline-source-map",
  entry: "./src/index.ts",
  mode: "development",
  target: "web",
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader",
      exclude: /node_modules/
    }]
  },
  output: {
    library: {type:"window"},
    filename: "bundle.js",
    path: path.resolve(__dirname, "build/js")
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"]
  },
};