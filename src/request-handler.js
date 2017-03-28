import path from "path";
import fs from "fs";
import mime from "mime-types";
import checkPath from "./helpers/check-path";
import readdirAsync from "./helpers/readdir";
import config from "./config";

export default (req, res) => {
  req.on("error", err => global.console.log(err));
  res.on("error", err => {
    global.console.log(err);
    res.end();
  });
  // res.on('pipe', (data) => console.log(data));
  // console.log(res);
  // req.on('data', (data) => console.log(data.toString('utf8')));
  const resolvedPath = path.resolve(config.rootDir, `./${req.url}`);
  checkPath(resolvedPath)
    .then(data => {
      if (data.isDirectory()) {
        return readdirAsync(resolvedPath);
      } else {
        res.setHeader("Content-Length", `${data.size}`);
        res.setHeader("Content-Type", mime.contentType(path.extname(resolvedPath)));
        res.setHeader("Server", "NodeJS Javascript.Ninja");
        res.setHeader("Connection", "keep-alive");
        fs.createReadStream(resolvedPath).pipe(res);
        return false;
      }
    })
    .then(files => {
      if (files) {
        if (files.includes("index.html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          const { size } = fs.statSync(`${resolvedPath}/index.html`);
          res.setHeader("Content-Length", `${size}`);
          fs.createReadStream(`${resolvedPath}/index.html`).pipe(res);
        } else if (req.url === "/") {
          const { size } = fs.statSync(`${resolvedPath}/static/index.html`);
          res.setHeader("Content-Length", `${size}`);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          fs.createReadStream(`${resolvedPath}/static/index.html`).pipe(res);
        }
      }
    })
    .catch(e => {
      console.log("*** Error to be caught ***");
      // Error code for permission denied?
      // EPERM??
      if (e.code === "ENOENT") {
        const size = fs.statSync("./src/static/404.html").size;
        res.setHeader("Content-Length", `${size}`);
        res.setHeader("Content-type", "text/html; charset=utf-8");
        res.writeHead(404);
        fs.createReadStream("./src/static/404.html").pipe(res);
      } else if (e.code === "EPERM") {
        res.setHeader("Content-type", "text/html; charset=utf-8");
        res.writeHead(400);
        res.write('Permission denied for this resource');
      }
    });
};
