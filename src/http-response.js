import { Writable } from "stream";

class HttpRresponse extends Writable {
  constructor(socket) {
    super();
    this.socket = socket;
    this.headersSent = false;
    this.headers = ['HTTP/1.x 200'];
  }

  _write(chunk, encoding, callback) {
    console.log(this.headers);
    this.socket.write(chunk);
    callback();
  }

  setHeader(headerName, value) {
    this.headers.push(`${headerName}: ${value}`);
  }

  // optional method
  writeHead(code) {
    this.headers.splice(0, 1, `HTTP/1.x ${code}`);
  }

  sendHeaders() {
    if (this.headersSent) {
      this.emit("error", () =>
        console.log("Cannot set header after headers are sent"));
    }
    const headers = this.headers.join("\r\n") + "\r\n";
    this.headersSent = true;
    this.socket.write(headers);
  }
}

export default HttpRresponse;
