import path from "path";
import fs from "fs";
import myHttp from "./http";
import checkPath from "./helpers/check-path";
import readdirAsync from "./helpers/readdir";
import config from "./config";

const server = myHttp.createServer();
server.listen({ port: 3000 });

server.on("request", (req, res) => {
  //   console.log(req.headers);
  //   console.log(req.method);
  //   console.log(req.url);
  // console.log(res);
  const resolvedPath = path.resolve(config.rootDir, `./${req.url}`);
  checkPath(resolvedPath)
    .then(data => data.isDirectory())
    .then(data => {
      if (data) {
        return readdirAsync(resolvedPath);
      } else {
        res.setHeader("Content-type", "text/html; charset=utf-8");
        fs.createReadStream(resolvedPath).pipe(res);
        return false;
      }
    })
    .then(files => {
      if (files) {
        if (files.includes("index.html")) {
          res.setHeader("Content-type", "text/html; charset=utf-8");
          fs.createReadStream(`${resolvedPath}/index.html`).pipe(res);
        } else if (resolvedPath === "/") {
          res.setHeader("Content-type", "text/html; charset=utf-8");
          fs.createReadStream("./static/index.html").pipe(res);
        }
      }
    })
    .catch(e => {
      console.log("Unhandled error");
      console.log(e);
      if (e.code === "ENOENT") {
        console.log("GOES DOWN HERE");
        // socket.write(writeHeaders(400, "text/html"));
        fs.createReadStream("./static/404.html").pipe(res);
      }
    });
  
  // res.setHeader("Content-Type", "application/json");
  //   res.writeHead(200) //Вызов writeHead опционален
  //   fs.createReadStream('somefile.txt').then(s => s.pipe(res));
});
