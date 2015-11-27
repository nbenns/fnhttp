'use strict';

let Response = require('./response');
let _ = require('ramda');

let _Request = function (httpVersion, method, uri, queryParams, headers, body) {
	this.httpVersion = httpVersion;
	this.method = method;
	this.uri = uri;
	this.queryParams = queryParams;
	this.headers = headers;
	this.body = body;
}

let Request = (httpVersion, method, uri, queryParams, headers, body) => {
	return new _Request(httpVersion, method, uri, queryParams, headers, body);
}

_Request.prototype = {
	map: function (f) {
		return Request.apply(null, f(this.httpVersion, this.method, this.uri, this.queryParams, this.headers, this.body));
	},

	chain: function (f) {
		return f(this.httpVersion, this.method, this.uri, this.queryParams, this.headers, this.body);
	},

	respond: function () {
		return Response(this.httpVersion, 404, {}, 'There is no route matching you\'re request').respond();
	}
}

let bufferToText = _.compose(_.split('\n'), _.toString);

let firstLine = _.compose(_.head, bufferToText);

let parseMethod = _.compose(_.head, _.match(/^\w+/g), firstLine);

let parseUri = _.compose(_.head, _.match(/\/[/\w_\.-]*\/?/), firstLine);

let parseHttpVersion = _.compose(
	_.head,
	_.drop(1),
	_.match(/HTTP\/(\d\.\d)/),
	firstLine
);

let parseQueryString = _.compose(
	_.map(decodeURI),
	_.fromPairs,
	_.map(_.split('=')),
	_.match(/[^&?]*?=[^&? ]*/g),
	firstLine
);

let parseHeaders = _.compose(
	_.invertObj,
	_.map(_.toLower),
	_.invertObj,
	_.fromPairs,
	_.map(
		_.compose(
			_.take(2),
			_.drop(1),
			_.match(/([\w\-_]+): (.*)$/)
		)
	),
	_.takeWhile(l => l !== ''),
	_.drop(1),
	bufferToText
);

let preParseBody = _.compose(
	_.join('\n'),
	_.takeLastWhile(l => l !== ''),
	_.dropLast(1),
	bufferToText
);

Request.fromBuffer = (bodyParsers, data) => {
	let method = parseMethod(data);
	let uri = parseUri(data);
	let httpVersion = parseHttpVersion(data);
	let queryParams = parseQueryString(data);
	let headers = parseHeaders(data);
	let rawBody = preParseBody(data);
	let body = null;

	if (rawBody != '') {
		// lookup content-type
		let ctype = headers['content-type']

		// see which bodyparser uses this content-type
		let parser = _.compose(
			_.head,
			_.filter(p => p.contentTypes.indexOf(ctype) >= 0)
		)(bodyParsers);

		// parse body
		if (parser) {
			body = parser.parse(rawBody);
			if (!body) return Response(httpVersion, 400, {}, 'Unable to parse request body');
			body.contentType = ctype;
		} else {
			return Response(httpVersion, 400, {}, 'Unable to handle Content-Type: ' + ctype);
		}
	} else {
		body = rawBody;
	}

	return Request(httpVersion, method, uri, queryParams, headers, body);
}

module.exports = Request;
