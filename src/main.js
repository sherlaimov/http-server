import myHttp from "./http";
import requestHandler from './request-handler';

const server = myHttp.createServer();
server.listen({ port: 3000 });

server.on("request", (req, res) => {
      global.console.log('headers', req.headers);
      global.console.log('method', req.method,);
      global.console.log('url', req.url);
      requestHandler(req, res);
});
