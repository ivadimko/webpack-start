const fs = require('fs');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const webpack = require('webpack');

const autoprefixer = require('autoprefixer');
const postcssSorting = require('postcss-sorting');
const cssmqPacker = require('css-mqpacker');
const sortMediaQueries = require('sort-css-media-queries');

const context = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

const scssUtilsPath = 'styles/utils';
const extractTextPlugin = new ExtractTextPlugin({
  filename: getPath => getPath('css/[name].css').replace('css/js', '.'),
});

const templateEntriesDir = path.resolve(context, 'templates/pages');

const pugFiles = fs.readdirSync(templateEntriesDir).map(file => file.split('.pug')[0]);

module.exports = {
  context,
  devServer: {
    contentBase: dist,
    stats: {
      assets: false,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: false,
      version: false,
      warnings: true,
    },
  },
  devtool: 'source-map', // 'cheap-module-eval-source-map', - for faster builds
  entry: {
    'js/main': './scripts/main.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.s?css$/,
        use: extractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
              importLoaders: 3,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer({
                  grid: true,
                }),
                postcssSorting,
                cssmqPacker({
                  sort: sortMediaQueries,
                }),
              ],
              sourceMap: true,
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compact',
              sourceMap: true,
              sourceComments: true,
            },
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.join(context, `${scssUtilsPath}/_vars.scss`),
                path.join(context, `${scssUtilsPath}/_mixins.scss`),
                path.join(context, `${scssUtilsPath}/_extends.scss`),
              ],
            },
          },
        ]),
      },
      {
        test: /\.(ttf|woff|woff2|eot|svg)$/,
        include: path.resolve(context, 'icomoon'),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: './fonts/icomoon',
          useRelativePath: false,
        },
      },
      {
        test: /^(?!.*\.generated\.ttf$).*\.ttf$/,
        exclude: path.resolve(context, 'icomoon'),
        use: extractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'fontface-loader',
          },
        ]),
      },
      {
        test: /\.generated.(ttf|eot|woff|woff2)$/,
        exclude: path.resolve(context, 'icomoon'),
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: './',
        },
      },
      {
        test: /.*\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 85,
              },
            },
          },
        ],
      },
      {
        test: /\.(svg|mp4)$/,
        exclude: [path.resolve(context, 'images/inline'), path.resolve(context, 'icomoon')],
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.svg$/,
        include: path.resolve(context, 'images/inline'),
        loader: 'svg-inline-loader',
        options: {
          removeTags: true,
          removingTags: ['title', 'desc', 'style'],
        },
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
          root: path.resolve(__dirname),
        },
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: dist,
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jQuery',
      jQuery: 'jQuery',
      'window.jQuery': 'jQuery',
    }),
    extractTextPlugin,
    ...pugFiles.map(file =>
      new HtmlWebpackPlugin({
        filename: `${file}.html`,
        template: `${templateEntriesDir}/${file}.pug`,
      })),
    new FaviconsWebpackPlugin({
      logo: './images/favicon.png',
      prefix: 'favicon/',
      persistentCache: true,
      inject: true,
      background: '#fff',
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: true,
      },
    }),

  ],
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: './js/vendor',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: {
      name: './js/manifest',
    },
  },
};
