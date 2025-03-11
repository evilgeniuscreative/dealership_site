const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/client.tsx',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'js/bundle.js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'ts-loader'
        },
        {
          test: /\.(scss|css)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'img/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),
      // We don't need HtmlWebpackPlugin since we're using our own HTML template
      // But we'll keep it commented in case it's needed later
      /*
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html'
      })
      */
    ],
    devServer: {
      historyApiFallback: true,
      proxy: [
        {
          context: ['/m'],
          target: 'http://localhost:3001',
          pathRewrite: { '^/m': '/api' }
        },
        {
          context: ['/api'],
          target: 'http://localhost:3001'
        }
      ]
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};
