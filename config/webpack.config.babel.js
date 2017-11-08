import webpack from 'webpack';
import { resolve } from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import BabelMinifyPlugin from 'babel-minify-webpack-plugin';
import StatefulReactContainerPlugin from 'stateful-react-container-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';

const packageJson = require('../package');

function devProd(inDevelopment, inProduction) {
  return process.env.NODE_ENV === 'production' ? inProduction : inDevelopment;
}

const commonConfig = {
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
            [
              'env',
              {
                targets: {
                  electron: packageJson.dependencies.electron,
                },
              },
            ],
            'stage-0',
            'react',
          ],
          plugins: ['lodash'],
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
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new LodashModuleReplacementPlugin(),
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
                getLocalIdent: (context, localIdentName, localName) => {
                  const path = context.context;
                  return `${path.slice(path.lastIndexOf('/') + 1)}-${
                    localName
                  }`;
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
    new CopyPlugin([{ from: './main-process/default-config.yaml' }]),
  ],
};

export default [uiConfig, mainProcessConfig];
