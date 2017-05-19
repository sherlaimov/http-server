import { Readable } from 'stream';

class HttpRequest extends Readable {
  constructor(socket) {
    super();
    this.headersReceived = false;
    this.headers = null;
    this.method = null;
    this.url = null;
    this.socket = socket;
    this.RNRN = Buffer.from('\r\n\r\n');
    this.buffer = Buffer.alloc(0);
    this.socket
      .on('data', this.onData.bind(this))
      .on('error', this.onError.bind(this))
      .on('end', this.onEnd.bind(this))
      .on('close', this.onClose.bind(this));
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
        this.socket.pause();
        const headersBuf = this.buffer.slice(0, breakPos);
        this.parseHeaders(headersBuf);
        const bodyBuf = this.buffer.slice(breakPos + this.RNRN.length);
        this.socket.removeListener('data', this.onData);
        if (bodyBuf.length) {
          this.socket.unshift(bodyBuf);
        }
        // WITHOUT headers
        this.push(bodyBuf);
        this.emit('headers', this);
      }
    } else {
      //  push causes _read to fire
      this.push(data);
      //  when paused no data event would fire
      this.socket.pause();
    }
  }

  onEnd() {
    global.console.log('client disconnected');
    this.removeAllListeners('data');
    this.removeAllListeners('end');
    this.push(null);
  }

  onError(err) {
    global.console.log(err);
    this.emit('error', err);
  }

  onClose() {
    global.console.log('socket closed');
    this.emit('close', this);
  }

  parseHeaders(data) {
    const parsed = {};
    const string = data.toString('utf-8').split('\r\n');
    const firstLine = string.shift().split(' ');
    parsed.method = firstLine[0];
    parsed.url = firstLine[1];
    parsed.headers = {};
    string.forEach(header => {
      parsed.headers[header.split(':')[0]] = header.split(':')[1].trim();
    });
    this.headers = parsed.headers;
    this.url = parsed.url;
    this.method = parsed.method;
    return parsed;
  }
}

export default HttpRequest;
