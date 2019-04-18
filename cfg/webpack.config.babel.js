import webpack from 'webpack';
import { resolve } from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import CspHtmlPlugin from 'csp-html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const packageJson = require('../package');

function devProd(inDevelopment, inProduction) {
  return process.env.NODE_ENV === 'production' ? inProduction : inDevelopment;
}

const commonConfig = {
  mode: devProd('development', 'production'),
  devtool: devProd('source-map', false),
  context: resolve('./src/'),
  target: 'electron-renderer',
  output: {
    path: resolve('./build/'),
    filename: '[name].js',
  },
  stats: {
    children: false,
    modules: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            ...packageJson.babel.presets.filter(
              ([name]) => name !== '@babel/preset-env',
            ),
            [
              '@babel/preset-env',
              {
                targets: {
                  electron: packageJson.devDependencies.electron,
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
      [],
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              camelCase: 'dashes',
              importLoaders: 1,
              modules: true,
              getLocalIdent: (context, ident, name) => {
                const path = context.context;
                return `${path.slice(path.lastIndexOf('/') + 1)}-${name}`;
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...commonConfig.plugins,
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new HtmlPlugin({
      title: 'Wings',
    }),
    new CspHtmlPlugin({
      'base-uri': "'self'",
      'object-src': "'none'",
      'script-src': ["'self'"],
      'style-src': ["'self'"],
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
