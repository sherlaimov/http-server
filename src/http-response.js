import { Writable } from 'stream';

class HttpRresponse extends Writable {
  constructor(socket) {
    super();
    this.socket = socket;
    this.headersSent = false;
    this.codeStatus = 200;
    this.statusLine = `HTTP/1.x ${this.codeStatus} OK\r\n`;
    this.headers = {};
    this.socket.on('error', this.onError.bind(this));
  }

  _write(chunk, encoding, callback) {
    if (!this.headersSent) {
      this.sendHeaders();
    }
    this.socket.write(chunk);
    callback();
  }

  setHeader(headerName, value) {
    // trim values
    if (this.headersSent) {
      this.emit('error', 'Cannot set header after headrs are sent');
    }
    this.headers[headerName.trim()] = value.trim();
  }

  // optional method
  writeHead(code) {
    if (typeof code !== 'number') {
      this.emit('error', 'Status code must be a valid number');
      return;
    }
    this.statusLine = `HTTP/1.x ${code}\r\n`;
    this.sendHeaders();
  }
  setStatus(code) {
    if (typeof code !== 'number') {
      this.emit('error', 'Status code must be a valid number');
      return;
    }
    this.statusLine = `HTTP/1.x ${code}\r\n`;
  }
  sendHeaders() {
    if (this.headersSent) {
      this.emit('error', 'Cannot send headers after headers are sent');
      return;
    }
    const headers = `${Object.keys(this.headers).reduce(
      (a, b) => `${a}${b}: ${this.headers[b]}\r\n`,
      this.statusLine
    )}\r\n`;
    this.socket.write(headers);
    this.headersSent = true;
  }

  onError(err) {
    global.console.log(err);
    this.emit('error', err);
  }

  end(...args) {
    // content-length && connection !== close
    // if (args.length > 0) {
    //   this.socket.write(args.join("\r\n"));
    //   this.socket.end();
    // }
    this.socket.end();
  }
}

export default HttpRresponse;
