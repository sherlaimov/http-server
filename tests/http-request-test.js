import { Readable, Writable } from 'stream';
// import { Writable } from 'stream';
import fs from 'fs';
import test from 'ava';
import proxyquire from 'proxyquire';
import md5File from 'md5-file';
import randomString from 'random-string';
import request from 'supertest';
import HttpRequest from '../src/http-request';
import HttpResponse from '../src/http-response';
import myHttp from '../src/http';

const fakeHeaders1 = `GET /thedillonb/http-shutdown HTTP/1.1
Host: github.com
Connection: keep-alive
Cache-Control: max-age=0
`.replace(/\n/g, '\r\n');
const fakeHeaders2 = `Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64)
Accept-Encoding: gzip, deflate

`.replace(/\n/g, '\r\n');

const fakeBody = 'ABABAGALAMAGA';

// # 2
test.cb('#2 Httprequest -> Emits headers event once headers get sent', t => {
  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);
  requestStream.on('headers', () => {
    t.end();
  });
  fakeSocket.push(fakeHeaders1);
  fakeSocket.push(fakeHeaders2);
});

// # 3
test.cb('#3 HttpResponse -> Emits error if setHeader is invoked after headers are sent', t => {
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {},
  });
  const res = new HttpResponse(fakeSocket);
  res.on('error', () => t.end());
  res.write('Writing into you');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
});

// # 4
test('#4 HttpResponse -> writeHead writes correct HTTP response to fake socket', t => {
  t.plan(1);
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {
      t.is(chunk.toString(), 'HTTP/1.x 400\r\n\r\n');
    },
  });
  const res = new HttpResponse(fakeSocket);
  res.writeHead(400);
});

// # 5
test.cb('#5 HttpRequest -> contains correct headers, url and method props', t => {
  t.plan(3);
  const headers = {
    Host: 'github.com',
    Connection: 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64)',
    'Accept-Encoding': 'gzip, deflate',
  };
  const url = '/thedillonb/http-shutdown';
  const method = 'GET';
  const fakeSocket = new Readable({ read: () => {} });
  const request = new HttpRequest(fakeSocket);
  request.on('headers', data => {
    t.is(url, data.url);
    t.is(method, data.method);
    t.deepEqual(headers, data.headers);
    t.end();
  });
  fakeSocket.push(fakeHeaders1);
  fakeSocket.push(fakeHeaders2);
});

// # 6
test.cb(
  '#6 HttpResponse -> Emits error if writeHead is invoked after head was already written',
  t => {
    const fakeSocket = new Writable({ write: (chunk, enc, cb) => {} });
    const res = new HttpResponse(fakeSocket);
    res.on('error', () => t.end());
    res.writeHead(400);
    res.writeHead(200);
  },
);

// test #7
test.cb('#7 HttpRequest -> is ReadableStream and contains body without headers', t => {
  t.plan(2);
  const fakeSocket = new Readable({ read: () => {} });
  const request = new HttpRequest(fakeSocket);
  fakeSocket.push(fakeHeaders1);
  fakeSocket.push(fakeHeaders2);
  fakeSocket.push(fakeBody);
  t.true(request instanceof Readable);
  request.on('data', data => {
    t.true(data.toString() === fakeBody);
    t.end();
  });
});

// # 8
test('#8 HttpResponse -> has setHeader method which does not send headers', t => {
  t.plan(1);
  const fakeSocket = new Writable({ write: (chunk, enc, cb) => {} });
  const res = new HttpResponse(fakeSocket);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Length', '100');
  t.falsy(res.headersSent);
});

// # 9
test('#9 HttpResponse -> All hearders set with setHeader should be written to socket', t => {
  t.plan(1);
  const headers = `HTTP/1.x 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nHost: localhost\r\n\r\n`;
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {
      t.is(headers, chunk.toString());
    },
  });
  const res = new HttpResponse(fakeSocket);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Host', 'localhost');
  res.sendHeaders();
});

// # 10
test('#10 HTTP -> modules contains createServer function', t => {
  myHttp.createServer ? t.pass() : t.fail();
});

// # 11
test('#11 HttpResponse -> setHeader method overwrites header with the same name', t => {
  t.plan(1);
  const targetHeader = { 'Content-Type': 'image/png' };
  const fakeSocket = new Writable({ write: (chunk, enc, cb) => {} });
  const res = new HttpResponse(fakeSocket);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Type', 'image/png');
  t.deepEqual(targetHeader, res.headers);
});

// # 13 //no idea how to implement
test.skip('#13 HTTP -> server correctly sends files to several clients simultaneously', t => {
  const filePath = './src/static/memWar.png';
  const hash = md5File.sync(filePath);
  console.log(`The MD5 sum of memWar.png is: ${hash}`);
  // создать 5 соединений
  // md5 node module
  // const fakeSocket = new Writable({ write: (chunk, enc, cb) => {
  //   const buf = Buffer.alloc(0);
  //   while (null !== chunk) {
  //   const file = Buffer.concat([buf, chunk]);
  // }
  // console.log(file);
  // } });
  // const res = new HttpResponse(fakeSocket);
  // const fakeSocket = new Readable({ read: () => {} });
  // const request = new HttpRequest(fakeSocket);

  const server = myHttp.createServer();

  request(server.listen({ port: 3000 }))
    // .get('http://localhost:3000/')
    .get('/')
    .expect(200)
    .end((err, res) => {
      console.log(res);
      fs.writeFile('file1.png', res);
      if (err) global.console.log(err);
    });

  server.on('request', (req, res) => {
    const file = fs.createReadStream(filePath);
    file.pipe(res);
  });
});

// # 14
test.cb('#14 HttpRequest -> should emit close event if socket was closed', t => {
  const fakeSocket = new Readable({ read: () => {} });
  const request = new HttpRequest(fakeSocket);
  request.on('close', () => {
    t.end();
  });
  fakeSocket.emit('close');
});

// # 15
test.skip(
  '#15 HTTP -> should close socket, when response end, and we are not in Keep-Alive mode.',
  t => {
    const fakeSocket = new Readable({ read: () => {} });
    const request = new HttpRequest(fakeSocket);
  },
);

test('#16 HTTP -> call to HttpServer listen should start server on corresponding port', t => {
  t.plan(1);
  const port = 3333;
  const stub = proxyquire('../src/http', {
    net: {
      createServer() {
        return {
          on() {},
          listen(myPort) {
            t.is(myPort, port);
          },
        };
      },
    },
  });
  const server = stub.default.createServer();
  server.listen({ port });
});

test.cb('#17 HttpRequest -> Should correctly handle headers coming in multiple chunks', t => {
  const headersFirst = `GET /thedillonb/http-shutdown HTTP/1.1
Host: github.com
Connection: keep-alive
Cache-Control: max-age=0
`.replace(/\n/g, '\r\n');
  const headersLast = `\r\n ... and here comes the body weeeeeee!`;
  const fakeSocket = new Readable({ read: () => {} });
  const request = new HttpRequest(fakeSocket);
  request.on('headers', () => {
    t.end();
  });
  fakeSocket.push(headersFirst);
  fakeSocket.push(headersLast);
});

// DO NOT KNOW HOW TO IMPLEMENT
test.skip('#18 HttpServer should emit request event', t => {
  const dataArr = ['asdasdasdsd', 213123123231];
  const fakeSocket = new Writable({ write: (chunk, enc, cb) => {} });
  const response = new HttpResponse(fakeSocket);

  dataArr.forEach(item => {
    response.write(item);
  });
});

test.cb('#19-1 HttpServer should handle errors on socket', t => {
  const fakeSocket = new Readable({ read: () => {} });
  const request = new HttpRequest(fakeSocket);
  request.on('error', () => t.end());
  fakeSocket.emit('error');
});

test.cb('#19-2 HttpServer should handle errors on socket', t => {
  const fakeSocket = new Writable({ write: (chunk, enc, cb) => {} });
  const response = new HttpResponse(fakeSocket);
  response.on('error', () => t.end());
  fakeSocket.emit('error', 'Error message');
});

// 20
// создать рандомный массив из строк или чисел, отослать, проверить боди
// писать write во Writable, проверить чанки внутри write
//

test('#20 should correctly send data in chunks to destination', t => {
  t.plan(1);
  const randStr = randomString({
    length: 150,
    numeric: true,
    letters: true,
    special: true,
  });
  const randArr = randStr.match(/.{50}/g);
  const incomingArr = [];
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {
      if (!chunk.toString('utf8').includes('\r\n\r\n')) {
        incomingArr.push(chunk.toString('utf8'));
      }
      if (incomingArr.length === 3) {
        t.deepEqual(incomingArr, randArr);
      }
      // WHY DO WE USE THIS CALLBACK?
      // DOES NOT WORK WITHOUT IT BEING USED...
      cb();
    },
  });

  const res = new HttpResponse(fakeSocket);
  randArr.forEach(str => {
    res.write(str);
  });
});

test('#27 HttpResponse should be Writable stream', t => {
  t.plan(1);
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {},
  });
  const res = new HttpResponse(fakeSocket);
  t.true(res instanceof Writable);
});

test.cb('#32 writeHead invoked with not a number -> HttpResponse emits error', t => {
  const fakeSocket = new Writable({
    write: (chunk, enc, cb) => {},
  });
  const res = new HttpResponse(fakeSocket);
  res.on('error', () => {
    t.end();
  });
  res.writeHead('asd');
});
