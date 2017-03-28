import myHttp from "./http";
import requestHandler from './request-handler';

const server = myHttp.createServer();
server.listen({ port: 3000 });

server.on("request", (req, res) => {
      requestHandler(req, res);
});
