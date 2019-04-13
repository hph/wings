import webpack from 'webpack';
import { resolve } from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import CspHtmlPlugin from 'csp-html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import BabelMinifyPlugin from 'babel-minify-webpack-plugin';
import StatefulReactContainerPlugin from 'stateful-react-container-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const packageJson = require('../package');

function devProd(inDevelopment, inProduction) {
  return process.env.NODE_ENV === 'production' ? inProduction : inDevelopment;
}

const commonConfig = {
  devtool: 'source-map',
  context: resolve('./src/'),
  target: 'electron-renderer',
  output: {
    path: resolve('./build/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            ...packageJson.babel.presets,
            [
              'env',
              {
                targets: {
                  electron: packageJson.dependencies.electron,
                },
              },
            ],
          ],
          plugins: packageJson.babel.plugins,
        },
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.css', '.js', '.json'],
    alias: {
      // Load a file based on NODE_ENV. This enables dynamic imports without
      // including all possible modules in the production bundle.
      'webpack-environment-specific-relative-module': devProd(
        './development',
        './production',
      ),
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    ...devProd(
      [new webpack.NamedModulesPlugin(), new webpack.NoEmitOnErrorsPlugin()],
      [
        new BabelMinifyPlugin(
          {},
          {
            comments: false,
            sourceMap: true,
          },
        ),
      ],
    ),
  ],
};

const uiConfig = {
  ...commonConfig,
  entry: {
    ui: './ui/',
  },
  module: {
    ...commonConfig.module,
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                camelCase: 'dashes',
                importLoaders: 1,
                minimize: devProd(false, true),
                modules: true,
                getLocalIdent: (context, ident, name) => {
                  const path = context.context;
                  return `${path.slice(path.lastIndexOf('/') + 1)}-${name}`;
                },
              },
            },
          ],
        }),
      },
    ],
  },
  plugins: [
    ...commonConfig.plugins,
    new ExtractTextPlugin({
      filename: 'styles.css',
      allChunks: true,
    }),
    new HtmlPlugin({
      title: 'Wings',
    }),
    new CspHtmlPlugin({
      'base-uri': "'self'",
      'object-src': "'none'",
      'script-src': ["'self'"],
      'style-src': ["'self'"],
    }),
    new StatefulReactContainerPlugin({
      noState: true,
    }),
  ],
};

const mainProcessConfig = {
  ...commonConfig,
  entry: {
    'main-process': './main-process/',
  },
  node: false,
  plugins: [
    ...commonConfig.plugins,
    new CopyPlugin([{ from: './main-process/default-config.json' }]),
  ],
};

export default [uiConfig, mainProcessConfig];
