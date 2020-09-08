const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const TerserPlugin = require('terser-webpack-plugin');

module.exports = env => {

  const envKeys = env ? Object.keys(env).
  reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {}) : {};

  return {
    entry: "./src/index.tsx",
    mode: "production",
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './public/build',
    },
    output: {
      path: path.resolve(__dirname, 'public/build'),
      filename: 'bundle.js',
      library: 'shop',
      libraryTarget: 'window',
      libraryExport: 'default'
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
      //new BundleAnalyzerPlugin(),
    ],
    optimization: {
      // providedExports: false,
      // usedExports: false,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false, // Must be set to true if using source-maps in production (10x increase in bundle size)
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            extractComments: true
          }
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: /src|_proto/,
          exclude: /node_modules/,
          loader: "ts-loader"
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".js", ".tsx"]
    }
  }
};
