import fs from 'fs';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
const context = path.resolve(__dirname, 'src'),
    templateEntriesDir = 'templates/pages';
export default function (env, argv) {
    return {
        context: context,
        devServer: {
            contentBase: path.resolve(__dirname, 'assets')
        },
        devtool: 'source-map',
        entry: {
            'js/main': './scripts/main.js'
        },
        externals: {
            jquery: "jQuery"
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                },
                {
                    test: /\.s?css$/,
                    exclude: /(node_modules)/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    // https://github.com/webpack-contrib/css-loader/issues/228#issuecomment-204607491
                                    importLoaders: 3,
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: () => [
                                        require('autoprefixer')
                                    ],
                                    sourceMap: true
                                }
                            },
                            'resolve-url-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: true,
                                    sourceComments: true
                                }
                            }
                        ]
                    })
                },
                {
                    test: /\.pug$/,
                    loader: 'pug-loader',
                    options: {
                        pretty: true
                    }
                },
                {
                    test: /.*\.(gif|png|jpe?g)$/i,
                    use: [
                        'srcset-loader',
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[path][name]__[sha512:hash:base64:5].[ext]'
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    quality: 85
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                },
                {
                    test: /\.(ttf|woff|eot)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './assets',
                        useRelativePath: true
                    }
                },
                {
                    test: /\.mp4$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                }
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'assets')
        },
        plugins: [
            new ExtractTextPlugin('css/main.css'),
            /*new FaviconsWebpackPlugin({
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
                    windows: true
                }
            }),*/
            ...fs.readdirSync(path.resolve(context, templateEntriesDir))
                .map(filename =>
                    new HtmlWebpackPlugin({
                        filename: filename.replace(/\.pug$/, '.html'),
                        template: `${templateEntriesDir}/${filename}`,
                        hash: true,
                        minify: false
                    })
                )
        ],
        resolve: {
            alias: {
                'masonry': 'masonry-layout',
                'isotope': 'isotope-layout'
            }
        }
    }
}