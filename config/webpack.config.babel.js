import webpack from 'webpack';
import { resolve } from 'path';
import HtmlPlugin from 'html-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import StatefulReactContainerPlugin from 'stateful-react-container-webpack-plugin';


function devProd (inDevelopment, inProduction) {
  return process.env.NODE_ENV === 'production'
    ? inProduction
    : inDevelopment;
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
                  electron: '1.6.10',
                },
              },
            ],
            'stage-2',
            'react',
          ],
          plugins: [
            [
              'module-resolver',
              {
                root: [
                  './src',
                ],
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    ...devProd([
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ], [
      new BabiliPlugin({}, {
        comments: false,
        sourceMap: true,
      }),
    ]),
  ],
};

const uiConfig = {
  ...commonConfig,
  entry: {
    ui: './ui/',
  },
  plugins: [
    ...commonConfig.plugins,
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
  node: {
    __dirname: false,
    __filename: false,
  },
};


export default [uiConfig, mainProcessConfig];
