import path from "path";
import fs from "fs";
import myHttp from "./http";
import checkPath from "./helpers/check-path";
import readdirAsync from "./helpers/readdir";
import config from "./config";

const server = myHttp.createServer();
server.listen({ port: 3000 });

server.on("request", (req, res) => {
  req.on('error', (err) => global.console.log(err));
  // console.log(res);
  // req.on('data', (data) => console.log(data.toString('utf8')));
  const resolvedPath = path.resolve(config.rootDir, `./${req.url}`);
  checkPath(resolvedPath)
    .then(data => {
      if (data.isDirectory()) {
        return readdirAsync(resolvedPath);
      } else {
        console.log(data);
        res.setHeader("Content-Length", `${data.size}`);
        res.setHeader("Content-type", "text/html; charset=utf-8");
        res.setHeader("Server", "Node Javascript.Ninja");
        fs.createReadStream(resolvedPath).pipe(res);
        return false;
      }
    })
    .then(files => {
      if (files) {
        if (files.includes("index.html")) {
          res.setHeader("Content-type", "text/html; charset=utf-8");
          const {size} = fs.statSync(`${resolvedPath}/index.html`);
          res.setHeader("Content-Length", `${size}`);
          fs.createReadStream(`${resolvedPath}/index.html`).pipe(res);
        } else if (req.url === "/") {
          const {size} = fs.statSync(`${resolvedPath}/static/index.html`);
          res.setHeader("Content-Length", `${size}`);
          res.setHeader("Content-type", "text/html; charset=utf-8");
          fs.createReadStream(`${resolvedPath}/static/index.html`).pipe(res);
        } 
      }
    })
    .catch(e => {
      console.log("Unhandled error");
      // console.log(e);
      if (e.code === "ENOENT") {
        console.log("GOES DOWN HERE");
        const size = fs.statSync("./src/static/404.html").size;
        res.setHeader("Content-Length", `${size}`);
        res.setHeader("Content-type", "text/html; charset=utf-8");
        fs.createReadStream("./src/static/404.html").pipe(res);
      }
    });

  // res.setHeader("Content-Type", "application/json");
  //   res.writeHead(200) //Вызов writeHead опционален
  //   fs.createReadStream('somefile.txt').then(s => s.pipe(res));
});
