/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const glob = require("glob");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "production",
  stats: { warnings: false },
  entry: glob
    .sync("./src/**/*.{ts,js,json}", {
      ignore: ["./src/**/*.test.ts", "public/**/*"],
    })
    .reduce((acc, file) => {
      acc[file.replace("src/", "").replace(".ts", "")] = path.resolve(
        __dirname,
        file
      );
      return acc;
    }, {}),
  target: "node",
  devtool: "source-map",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: {
          mangle: false,
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          },
          format: {
            preamble: "",
          },
        },
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
    libraryTarget: "commonjs",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@settings": path.resolve(__dirname, "src/settings"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@services": path.resolve(__dirname, "src/services"),
      "@database": path.resolve(__dirname, "src/database"),
      "@common": path.resolve(__dirname, "src/common"),
    },
    modules: [path.resolve(__dirname, "dist", "node_modules"), "node_modules"],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "./src/public",
          to: "public",
        },
        {
          from: "package.json",
          to: "package.json",
          transform(content) {
            const packageJson = JSON.parse(content.toString());
            delete packageJson.devDependencies;
            packageJson.scripts = {
              start: "pm2 start ecosystem.config.js && pm2 logs",
              db: "node ./database/migrate.js",
              "generate:token": "node ./commands/createApiKey",
            };
            return JSON.stringify(packageJson, null, 2);
          },
        },
        {
          from: "pnpm-lock.yaml",
          to: "pnpm-lock.yaml",
        },
        {
          from: "ecosystem.config.js",
          to: "ecosystem.config.js",
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        loader: "ts-loader",
        test: /\.ts?$/,
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  },
  externals: [nodeExternals()],
};
