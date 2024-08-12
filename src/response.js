class Response {
  constructor(body, statusCode, headers) {
    let pullBody = body && (body.body || body.statusCode || body.headers);
    this.statusCode = (pullBody ? body.statusCode : statusCode) || 200;
    let populatedHeaders = (pullBody ? body.headers : headers) || {};
    this.isBase64Encoded = (pullBody ? body.isBase64Encoded : false) || false;
    this.body = (this.statusCode === 204 || this.statusCode === 304) ? undefined : (pullBody ? body.body : body);

    if (!this.body) {
      delete this.body;
      populatedHeaders = Object.assign({ 'Access-Control-Allow-Origin': '*' }, populatedHeaders);
    } else if (this.body && this.body instanceof Buffer) {
      populatedHeaders = Object.assign({ 'Content-Type': 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }, populatedHeaders);
    } else {
      this.body = this.isBase64Encoded || typeof this.body !== 'object' ? this.body : JSON.stringify(this.body);
      populatedHeaders = Object.assign({ 'Content-Type': 'application/links+json', 'Access-Control-Allow-Origin': '*' }, populatedHeaders);
    }

    this.multiValueHeaders = Object.keys(populatedHeaders).reduce((agg, h) => {
      agg[h] = Array.isArray(populatedHeaders[h]) ? populatedHeaders[h] : [populatedHeaders[h]].filter(v => v !== '' && v !== null && v !== undefined).map(v => `${v}`);
      return agg;
    }, {});
  }
}

module.exports = Response;
