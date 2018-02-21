import myHttp from "./http";
import requestHandler from './request-handler';

const server = myHttp.createServer();
server.listen({ port: 3000 });

server.on("request", (req, res) => {
      console.log('headers', req.headers);
      console.log('method', req.method,);
      console.log('url', req.url);
      requestHandler(req, res);
});
