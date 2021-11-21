// import { VueLoaderPlugin  } = require('vue-loader')
const VueLoaderPlugin = require( "vue-loader" ).VueLoaderPlugin
const path = require('path');
// const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');


module.exports = {

    entry: {
        // main: path.resolve( __dirname, '../src/index.js'),
        // main: path.resolve( __dirname, './index.js'),
        main: path.resolve( __dirname, './src/index.js'),
    },

    output: {
        path: path.join( __dirname, "." ),
        filename: "main.js"
    },

    // target: "node",

    module: {

        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },

            {
                test: /\.pug$/,
                loader: 'vue-pug-loader'

            },

            {
                test: /\.svg$/,
                use: ['babel-loader', 'vue-svg-loader'],
            },

            /*
            {
                test: /\.svg$/,
                use: ['svg-inline-loader'],
            },
            */

            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },

        ]

    },

    plugins: [
        // make sure to include the plugin!
        new VueLoaderPlugin(),

        /*
        new ImageMinimizerPlugin({
          minimizerOptions: {
            plugins: [
              [
                'imagemin-svgo',
                {
                  plugins: [
                    // SVGO options is here "https://github.com/svg/svgo#what-it-can-do"
                    {
                      removeViewBox: false,
                      removeXMLNS: true,
                    },
                  ],
                },
              ],
            ],
          },
        }),
        */



    ]
}
