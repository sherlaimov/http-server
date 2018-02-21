const writeHeaders = function writeHeaders(code, cType) {
  const headers = [
    `HTTP/1.x ${code}`,
    `Date: ${new Date().toUTCString()}`,
    'Server: Node Javascript.Ninja',
    `Content-Type: ${cType}`,
    '\r\n'
  ].join('\r\n');
  return headers;
};

module.exports = writeHeaders;
