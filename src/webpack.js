import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

function compilerOption() {
  return {
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
      children: false,
    },
  };
}

function initProgress(webpackConfig) {
  let chars = 0;
  webpackConfig.plugins.push(new webpack.ProgressPlugin((_percentage, _msg) => {
    let percentage = _percentage;
    let msg = _msg;
    function lineStart(message) {
      let str = '';
      for (; chars > message.length; chars -= 1) {
        str += '\b \b';
      }
      chars = message.length;
      for (let i = 0; i < chars; i += 1) {
        str += '\b';
      }
      if (str) process.stderr.write(str);
    }
    if (percentage < 1) {
      percentage = Math.floor(percentage * 100);
      msg = `${percentage}% ${msg}`;
    }
    lineStart(msg);
    process.stderr.write(msg);
  }));
}

function injectHMR(options) {
  const webpackConfig = options.webpackConfig;
  let entries = webpackConfig.entry;
  if (typeof entries === 'string') {
    entries = [entries];
  }
  const protocol = options.https ? 'https' : 'http';
  const url = `${protocol}://127.0.0.1:${options.serverPort}`;
  const hotMiddleWarePath = path.join(__dirname, '../node_modules/webpack-hot-middleware');
  const hotScripts = [
    `${hotMiddleWarePath}/client?reload=true&path=${url}/__webpack_hmr`,
  ];
  if (_.isPlainObject(entries)) {
    Object.keys(entries).forEach((key) => {
      let value = entries[key];
      if (!Array.isArray(value)) {
        if (typeof value === 'string') {
          value = [value];
        } else {
          value = [];
        }
      }
      entries[key] = value.concat(hotScripts);
    });
  } else if (Array.isArray(entries)) {
    entries = entries.concat(hotScripts);
  }
  webpackConfig.entry = entries;
  webpackConfig.plugins = webpackConfig.plugins.concat(new webpack.HotModuleReplacementPlugin());
}

export default function (app, options, callback) {
  const webpackConfig = options.webpackConfig;
  if (options.hotLoad) {
    // 热更新设置
    injectHMR(options);
  }
  try {
    initProgress(webpackConfig);
    const compiler = webpack(webpackConfig);
    compiler.apply(new webpack.ProgressPlugin((percentage) => {
      if (percentage >= 1) {
        setTimeout(() => {
          callback && callback();
        }, 0);
      }
    }));
    const middleware = webpackDevMiddleware(compiler, compilerOption(webpackConfig));
    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
  } catch (e) {
    console.log(chalk.red('Compile error, exit.\n'));
    console.log(e);
    process.exit(1);
  }
}
