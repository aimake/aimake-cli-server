import http from 'http';
import queryString from 'querystring';

export default function (proxySerever, request, response) {
  const method = request.method;
  const postParams = queryString.stringify(request.body);
  const originalUrl = request.originalUrl;

  const options = {
    host: proxySerever.host,
    port: proxySerever.port || 80,
    path: originalUrl,
    method,
    headers: {},
  };

  console.log(`Remote request(${method}): http://${proxySerever.host}:${proxySerever.port || 80}${originalUrl}`);

  // cookie
  options.headers.cookie = proxySerever.cookie || '';
  // post
  if (method.toLowerCase() === 'post') {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = postParams.length;
  }

  // 发送线上的数据请求
  const req = http.request(options, (res) => {
    res.setEncoding('utf8');
    let str = '';
    res.on('data', (d) => {
      str += d;
    });
    res.on('end', () => {
      let data;
      try {
        data = JSON.parse(str);
      } catch (ex) {
        data = str;
      }
      console.log(`Remote response: ${JSON.stringify(data)}`);
      response.json(data);
    });
    res.on('error', (err) => {
      console.log('Remote response error: ', JSON.stringify(err));
      response.end(`Reponse error: ${err.message}`);
    });
  });
  req.on('error', (err) => {
    console.log('Remote response error: ', JSON.stringify(err));
    response.end(`Request error: ${err.message}`);
  });
  req.write(postParams);
  req.end();
}
