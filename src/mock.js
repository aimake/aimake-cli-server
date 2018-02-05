import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import request from './tools/request';

const REGEXP_OPTIONAL_PARAM = /\((.*?)\)/g;
const REGEXP_NAMED_PARAM = /(\(\?)?:\w+/g;
const REGEXP_SPLAT_PARAM = /\*\w+/g;
const REGEXP_ESCAPE = /[-{}[\]+?.,\\^$|#\s]/g;

function routeToRegExp(_route) {
  const route = _route.replace(REGEXP_ESCAPE, '\\$&')
    .replace(REGEXP_OPTIONAL_PARAM, '(?:$1)?')
    .replace(REGEXP_NAMED_PARAM, (match, optional) => (optional ? match : '([^/?]+)'))
    .replace(REGEXP_SPLAT_PARAM, '([^?]*?)');
  return new RegExp(`^${route}(?:\\?([\\s\\S]*))?$`);
}

export default function mock(app, options) {
  const mockApiPath = path.join(process.cwd(), options.mockapi);

  const matchRules = function matchRules(url) {
    let result = null;
    let apiRule;
    // 读取规则配置文件
    try {
      delete require.cache[mockApiPath];
      apiRule = require(mockApiPath);
    } catch (e) {
      apiRule = {};
    }
    // 规则正则匹配
    const rules = apiRule.rules || {};
    Object.keys(rules).forEach((key) => {
      const routeReg = routeToRegExp(key);
      if (routeReg.test(url)) {
        result = rules[key];
      }
    });
    return result;
  };

  app.use('*', (req, res, next) => {
    let apiRule;
    try {
      delete require.cache[mockApiPath];
      apiRule = require(mockApiPath);
    } catch (e) {
      apiRule = {};
    }
    if (!matchRules(req.originalUrl)) {
      // 兼容不在匹配规则下面的
      if (req.originalUrl.indexOf('mock') !== -1) {
        // 远程代理
        if (apiRule.proxy === true && apiRule.proxyServer) {
          request(apiRule.proxyServer, req, res);
          return;
        }
        // 本地数据
        if (fs.existsSync(process.cwd() + req.originalUrl)) {
          const stream = fs.createReadStream(process.cwd() + req.originalUrl);
          console.log(`Mock data: ${chalk.yellow(req.originalUrl)} => ${chalk.yellow(process.cwd() + req.originalUrl)}`);
          stream.pipe(res);
        } else {
          // 找不到文件
          console.log(chalk.red(`Mock error: ${chalk.yellow(req.originalUrl)} can not find ${chalk.yellow(process.cwd() + req.originalUrl)}`));
          res.end(JSON.stringify({ message: 'Mock not found' }));
        }
        return;
      }
      next();
      return;
    }
    // 远程代理
    if (apiRule.proxy === true && apiRule.proxyServer) {
      request(apiRule.proxyServer, req, res);
      return;
    }
    // 本地数据模拟
    const key = req.originalUrl;
    const value = matchRules(req.originalUrl);
    const mockPath = path.join(path.dirname(mockApiPath), value);
    if (fs.existsSync(mockApiPath)) {
      console.log(`Mock data: ${chalk.yellow(key)} => ${chalk.yellow(mockPath)}`);
      delete require.cache[mockPath];
      if (path.extname(mockPath) === '.json') {
        if (req.query.callback) {
          // jsonp
          const str = `${req.query.callback}(${JSON.stringify(require(mockPath))})`;
          res.end(str);
        } else {
          // json
          res.send(require(mockPath));
        }
      } else if (path.extname(mockPath) === '.js') {
        // JS定义接口返回
        const fn = require(mockPath);
        fn(req, res, next);
      } else {
        next();
      }
    } else {
      // 找不到文件
      console.log(chalk.red(`Mock error: ${chalk.yellow(req.originalUrl)} can not find ${chalk.yellow(mockApiPath)}`));
      res.end(JSON.stringify({ message: 'mock not found' }));
    }
  });
}
