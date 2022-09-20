module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://nestjs_container:3000',
        changeOrigin: true,
        secure: false, 
        pathRewrite: {
          '^/api': '/api'
        },
        headers: {
          Connection: 'keep-alive'
        },
        logLevel: 'debug' 
      },
    }
  },
}