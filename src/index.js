import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import ip from 'ip';
import express from 'express';
import chalk from 'chalk';
import _ from 'lodash';
import opn from 'opn';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import fallback from 'express-history-api-fallback';
import xweinre from 'xweinre';

import config from './config';
import mockServer from './mock';
import webpack from './webpack';
import util from './util';
import weinre from './weinre';
import proxyServer from './tools/proxy';

const privateKey = fs.readFileSync(path.join(__dirname, '../ssl/server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, '../ssl/server.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };
const defaultOptions = config.defaultOptions;

// hide webpack deprecation warning
process.noDeprecation = true;

async function run(_options, _callback) {
  const options = _options;
  const callback = _callback;
  // 端口号
  let port = parseInt(options.serverPort, 10);
  let firstBuild = true;
  let server = null;
  const httpsOpt = options.https;
  const open = options.openBrowser;
  const host = options.host;
  const ipAddr = host || ip.address();
  const app = express();

  let targetPort;
  try {
    targetPort = await util.findPort(port, ipAddr);
  } catch (e) {
    targetPort = port;
  }
  if (targetPort !== port) {
    console.log(chalk.yellow(`\nPort ${port} has been occupied. It has automatically switched to ${targetPort}`));
    port = targetPort;
    options.serverPort = targetPort;
  }
  const address = `${httpsOpt ? 'https' : 'http'}://localhost:${port}`;
  const printServerTable = function printServerTable() {
    let proxyText = '';
    if (options.proxy) {
      proxyText = `
      ${chalk.yellow('Proxy service：')}
      Local proxy service\t=> http://${ipAddr}:${options.proxyServer.proxyPort}
      Request proxy monitoring\t=> http://${ipAddr}:${options.proxyServer.webPort}`;
    }
    console.log(`
      -------------- Service configuration --------------
      Local IP address\t=> ${ipAddr}
      Static resource service\t=> ${address}
      ${proxyText}
    `);
  };

  const buildSuccess = function buildSuccess() {
    if (!firstBuild) {
      printServerTable();
      return;
    }
    firstBuild = false;

    printServerTable();
    if (open) {
      opn(address);
    }
    if (options.weinre) {
      opn(xweinre.run());
    }
  };

  if (httpsOpt) {
    server = https.createServer(credentials, app);
  } else {
    server = http.createServer(app);
  }

  // 开启代理软件
  if (options.proxy) {
    await proxyServer(options);
  }

  /* ------- 中间件 ------- */
  // 支持跨域
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , x-access-token');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
  });

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());

  // 静态服务器
  app.use(serveStatic('.'));

  // 远程调试脚本注入
  if (options.weinre) {
    weinre.inject(app, options);
  }

  // 编译
  if (options.webpackConfig) {
    webpack(app, options, buildSuccess);
  } else {
    // 只作静态服务器
    buildSuccess();
  }

  // 本地模拟数据
  mockServer(app, options);

  // 显示目录
  app.use(serveIndex('.'));

  // historyApiFallback
  if (options.historyApiFallback === true) {
    app.use(fallback('index.html', { root: process.cwd() }));
  }
  /* ------- 中间件 ------- */

  server.listen(port);

  callback && callback(app);
}

export default function (options, callback) {
  // 合并配置
  const combineOptions = _.defaults(options || {}, defaultOptions);
  // 启动服务器
  run(combineOptions, callback);
}
