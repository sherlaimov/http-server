import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import checkPath from './helpers/check-path';
import readdirAsync from './helpers/readdir';
import config from './config';

export default (req, res) => {
  const resolvedPath = path.resolve(config.publicDir, `./${req.url}`);
  checkPath(resolvedPath)
    .then(data => {
      if (data.isDirectory()) {
        return readdirAsync(resolvedPath);
      }
      res.setHeader('Content-Length', `${data.size}`);
      res.setHeader('Content-Type', mime.contentType(path.extname(resolvedPath)));
      res.setHeader('Server', 'NodeJS Javascript.Ninja');
      res.setHeader('Connection', 'keep-alive');
      fs.createReadStream(resolvedPath).pipe(res);
      return false;
    })
    .then(files => {
      if (files) {
        if (files.includes('index.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          const { size } = fs.statSync(`${resolvedPath}/index.html`);
          res.setHeader('Content-Length', `${size}`);
          fs.createReadStream(`${resolvedPath}/index.html`).pipe(res);
        }
      }
      return false;
    })
    .catch(e => {
      global.console.log(e);
      if (e.code === 'ENOENT') {
        const { size } = fs.statSync('./src/static/404.html');
        res.setHeader('Content-Length', `${size}`);
        res.setHeader('Content-type', 'text/html; charset=utf-8');
        res.writeHead(404);
        fs.createReadStream('./src/static/404.html').pipe(res);
      } else if (e.code === 'EACCES' || e.code === 'EPERM') {
        res.setHeader('Content-type', 'text/html; charset=utf-8');
        res.writeHead(400);
        res.end('Permission denied for this resource');
      }
    });
};
