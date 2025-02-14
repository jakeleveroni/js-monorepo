const path = require("path");
const SpinSdkPlugin = require("@fermyon/spin-sdk/plugins/webpack");

module.exports = {
  entry: "./src/functions/ecmascript/fetch-active-git-repos.ts",
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "./out/build"),
    filename: "bundle.js",
    module: true,
    library: {
      type: "module",
    },
  },
  plugins: [new SpinSdkPlugin()],
  optimization: {
    minimize: false,
  },
  performance: {
    hints: false,
  },
};
