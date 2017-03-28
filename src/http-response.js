import { Writable } from "stream";

class HttpRresponse extends Writable {
  constructor(socket) {
    super();
    this.socket = socket;
    this.headersSent = false;
    this.headers = ["HTTP/1.x 200 OK"];
  }

  _write(chunk, encoding, callback) {
    if ( ! this.headersSent) {
      this.sendHeaders();
    }
    this.socket.write(chunk);
    callback();
  }

  setHeader(headerName, value) {
    if (this.headersSent) {
      throw new Error('Cannot set header after headrs are sent');
    }
    this.headers.push(`${headerName}: ${value}`);
  }

  // optional method
  writeHead(code) {
    // TODO:: should send headers?
    this.headers.splice(0, 1, `HTTP/1.x ${code}`);
    this.sendHeaders();
  }

  sendHeaders() {
    // if (this.headersSent) {
    //   this.emit("error", "Cannot send headers after headers are sent");
    //   return;
    // }
    const headers = this.headers.join("\r\n") + "\r\n\r\n";
    this.headersSent = true;
    this.socket.write(headers);
  }
  end(...args){
    console.log('*** response end ***');
    console.log(this.headers);
    // content-length && connection !== close
    // return args.length > 0 ? this.socket.write(args) : true;
    // this.socket.end();
  }
}

export default HttpRresponse;
