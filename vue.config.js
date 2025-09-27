const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = defineConfig({  
  transpileDependencies: true,
  // 公共路径(必须有的)
  publicPath: "/",
  // 输出文件目录
  outputDir: "dist",
  // 静态资源存放的文件夹(相对于ouputDir)
  assetsDir: "assets",
  // 指定 index.html 的路径
  indexPath: 'index.html',
  // eslint-loader 是否在保存的时候检查(果断不用，这玩意儿我都没装)
  lintOnSave: false,
  // 我用的only，打包后小些
  runtimeCompiler: false,
  productionSourceMap: true, // 不需要生产环境的设置false可以减小dist文件大小，加速构建

  devServer: {
    open: true, // npm run dev后自动打开页面
    host: '0.0.0.0', // 匹配本机IP地址(默认是0.0.0.0)
    port: 8018, // 开发服务器运行端口号
    https: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/img': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        // 不重写路径，保持 /img 前缀
      }
    },
  },
  
  chainWebpack: config => {
    // 确保 HTML 插件正确配置
    config
      .plugin('html')
      .tap(args => {
        args[0].template = path.resolve(__dirname, 'public/index.html')
        return args
      })
  },
  
  configureWebpack: {
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip', // 使用gzip压缩
        test: /\.js$|\.html$|\.css$/, // 匹配文件名
        filename: '[path][base].gz[query]', // 压缩后的文件名(保持原文件名，后缀加.gz)
        minRatio: 0.8, // 压缩率小于1才会压缩
        threshold: 512, // 对超过10k的数据压缩
        deleteOriginalAssets: false, // 是否删除未压缩的源文件，谨慎设置，如果希望提供非gzip的资源，可不设置或者设置为false（比如删除打包后的gz后还可以加载到原始资源文件）
      }),
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false), // 或者设置为true，根据你的需求
      }),
    ]
  }
})
