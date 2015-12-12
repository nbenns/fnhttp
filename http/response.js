'use strict';

const _ = require('ramda');

const statusMessages = {
	100: 'Continue',
	101: 'Switching Protocols',
	102: 'Processing',
	200: 'OK',
	201: 'Created',
	202: 'Accepted',
	203: 'Non-Authoritative Information',
	204: 'No Content',
	205: 'Reset Content',
	206: 'Partial Content',
	207: 'Multi-Status',
	208: 'Already Reported',
	226: 'IM Used',
	300: 'Multiple Choices',
	301: 'Moved Permanently',
	302: 'Found',
	303: 'See Other',
	304: 'Not Modified',
	305: 'Use Proxy',
	306: 'Switch Proxy',
	307: 'Temporary Redirect',
	308: 'Permanent Redirect',
	400: 'Bad Request',
	401: 'Unauthorized',
	402: 'Payment Required',
	403: 'Forbidden',
	404: 'Not Found',
	405: 'Method Not Allowed',
	406: 'Not Acceptable',
	407: 'Proxy Authentication Required',
	408: 'Request Timeout',
	409: 'Conflict',
	410: 'Gone',
	411: 'Length Required',
	412: 'Precondition Failed',
	413: 'Payload Too Large',
	414: 'URI Too Long',
	415: 'Unsupported Media Type',
	416: 'Range Not Satisfiable',
	417: 'Expectation Failed',
	418: 'I\'m A Teapot',
	419: 'Authentication Timeout',
	420: 'Enhance Your Calm',
	421: 'Misdirected Request',
	422: 'Unprocessable Entity',
	423: 'Locked',
	424: 'Failed Dependency',
	426: 'Upgrade Required',
	428: 'Precondition Required',
	429: 'Too Many Requests',
	431: 'Request Header Fields Too Large',
	440: 'Login Timeout',
	444: 'No Response',
	449: 'Retry With',
	450: 'Blocked by Windows Parental Controls',
	451: 'Unavailable For Legal Reasons',
	494: 'Request Header Too Large',
	495: 'Cert Error',
	496: 'No Cert',
	497: 'HTTP to HTTPS',
	498: 'Token expired/invalid',
	499: 'Client Closed Request',
	500: 'Internal Server Error',
	501: 'Not Implemented',
	502: 'Bad Gateway',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
	505: 'HTTP Version Not Supported',
	506: 'Variant Also Negotiates',
	507: 'Insufficient Storage',
	508: 'Loop Detected',
	509: 'Bandwidth Limit Exceeded',
	510: 'Not Extended',
	511: 'Network Authentication Required',
	520: 'Unknown Error',
	522: 'Origin Connection Timeout',
	598: 'Network read timeout error',
	599: 'Network connect timeout error'
};

const _Response = function (res) {
	this.res = {
		httpVersion: res.httpVersion,
		status: res.status,
		headers: res.headers,
		body: res.body
	};
}

const Response = (res) => {
	return new _Response(res);
}

_Response.prototype = {
	map: function (f) {
		return Response(this.res);
	},

	chain: function (f) {
		return Response(this.res);
	},

	respond: function (formatters) {
		let response = 'HTTP/' + this.res.httpVersion + ' ' + this.res.status + ' ' + statusMessages[this.res.status] + '\n\n';
		response += this.res.body.toString() + '\n\n';
		return response;
	},
	
	parse: function (bodyParsers) {
		return Response(this.res);
	}
}

Response.Builder = _.curry((status, headers, body, req) => {
	let res = {
		httpVersion: req.httpVersion,
		status: status,
		headers: headers,
		body: body
	};
	
	return Response(res);
});

_.mapObjIndexed((name, code, obj) => Response[_.replace(/['"\s\/\\-]/g, '', name)] = Response.Builder(code))(statusMessages);

module.exports = Response;
