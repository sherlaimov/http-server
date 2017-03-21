import { Readable } from "stream";

class HttpRequest extends Readable {
  constructor(socket) {
    super();
    this.headersReceived = false;
    this.headers = null;
    this.socket = socket;
    this.RNRN = Buffer.from("\r\n\r\n");
    this.buffer = Buffer.alloc(0);
    this.socket
      .on("data", this.onData.bind(this))
      .on("error", err => console.log(err))
      .on("end", () => console.log("client disconnected"))
      .on("close", () => console.log("socket closed"));
  }

  _read() {
    this.socket.resume();
  }

  onData(data) {
    if (!this.headersReceived) {
      this.buffer = Buffer.concat([this.buffer, data]);
      const breakPos = this.buffer.indexOf(this.RNRN);

      if (breakPos !== -1) {
        this.headersReceived = true;
        const headersBuf = this.buffer.slice(0, breakPos);
        this.headers = this.parseHeaders(headersBuf).headers;
        this.method = this.parseHeaders(headersBuf).method;
        this.url = this.parseHeaders(headersBuf).url;
        const bodyBuf = this.buffer.slice(breakPos + this.RNRN.length);
        if (bodyBuf.length) {
          this.socket.unshift(bodyBuf);
        }
        // this.socket.pause();
        this.emit("headers", this);
      }
    } else {
      //  push causes _read to fire
      this.push(data);
      //  when paused no data event would fire
      this.socket.pause();
    }
  }

  parseHeaders(data) {
    const parsed = {};
    const string = data.toString("utf-8").split("\r\n");
    const firstLine = string.shift().split(" ");
    parsed.method = firstLine[0];
    parsed.url = firstLine[1];
    parsed.headers = {};
    string.forEach(header => {
      parsed.headers[header.split(":")[0]] = header.split(":")[1].trim();
    });
    return parsed;
  }
}

export default HttpRequest;
