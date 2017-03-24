import net from "net";
import { EventEmitter } from "events";
import HttpRequest from "./http-request";
import HttpResponse from "./http-response";


class HTTP extends EventEmitter {
  constructor() {
    super();
    this.server = net.createServer();
    this.server.on("connection", this.onConnection.bind(this));
  }

  onConnection(socket) {
    const req = new HttpRequest(socket);
    const res = new HttpResponse(socket);
    req.on("headers", () => this.emit('request', req, res));
  }

  listen(options) {
    this.port = options.port || 3000;
    this.server.listen(this.port, () =>
      console.log(`Listening on port ${this.port}`));
  }
}

export default {
  createServer() {
    return new HTTP();
  }
};
