/* eslint-disable import/no-extraneous-dependencies */
const pkg = require('./package.json');

module.exports = {
  configureWebpack: {
    devtool: 'source-map',
  },
  transpileDependencies: true,
  publicPath: process.env.VUE_APP_PUBLIC_PATH,
  devServer: {
    proxy: {
      '/api-apigen-dotnet': {
        target: 'https://api-gateway.apiquality.io',
        changeOrigin: true,
        secure: true,
      },
      '/api-apigen-springboot': {
        target: 'https://api-gateway.apiquality.io',
        changeOrigin: true,
        secure: true,
      },
      '/api-apigen-python-dev': {
        target: 'https://api-gateway.apiquality.io',
        changeOrigin: true,
        secure: true,
      },
      '/db-explorer': {
        target: 'https://api-gateway.apiquality.io',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        //secure: false,
        secure: true,
        pathRewrite: { '^/db-explorer': '/api-dbexplorer-opendataspace-develop' },
        //pathRewrite: { '^/db-explorer': '' },
      },
      '/api-apiquality': {
        target: 'https://api-gateway.apiquality.io',
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/api-apiquality': '' },
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "~@/scss/style.scss";
        `,
      },
    },
  },
  chainWebpack: (config) => {
    config
      .plugin('define')
      .tap(([o = {}]) => {
        const options = o;
        options['process.env'].VUE_APP_VERSION = JSON.stringify(pkg.version);
        options['process.env'].VUE_APP_NAME = JSON.stringify(pkg.name);
        options['process.env'].VUE_APP_DESCRIPTION = JSON.stringify(pkg.description);
        options['process.env'].VUE_COMPILATION_DATE = new Date().getTime();
        return [options];
      });
  },
};
