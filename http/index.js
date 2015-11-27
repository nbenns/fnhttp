'use strict';

let es = require('event-stream');

let HTTP = (bodyParsers, routes) => {
  return es.map((data, cb) => {
    let res = HTTP.Request.fromBuffer(bodyParsers, data)
      .map(routes)
      .chain((ver, meth, uri, q, h, b) => HTTP.Response(ver, 420, {}, b))
      .respond();
    cb(null, res);
  })
}

HTTP.Request = require('./request');
HTTP.Response = require('./response');

let BodyParser = function (contentTypes, f) {
	this.contentTypes = contentTypes;
	this.parse = f;
}

HTTP.BodyParser = BodyParser;

module.exports = HTTP;
