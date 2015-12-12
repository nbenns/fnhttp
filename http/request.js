'use strict';

const Response = require('./response'),
		_ = require('ramda'),
		utils = require('./utils');

const _Request = function (req) {
	this.req = req;
}

const Request = (req) => {
	if (!req.httpVersion || !req.method || !req.uri) {
		return Response.BadRequest({}, 'Not a HTTP formatted request', req);
	}
	
	return new _Request(req);
}

_Request.prototype = {
	map: function (f) {
		return Request(f(this.req));
	},

	chain: function (f) {
		return f(this.req)
	},

	respond: function (formatters) {
		return Response.NotFound({}, 'There is no route matching you\'re request', this.req).respond(formatters);
	},
	
	parse: function (bodyParsers) {
		return _.compose(
			_.ifElse(
				_.equals(this),
				fn => Response.BadRequest({}, 'No Parser for Content-Type', fn.req),
				_.identity
			),
			_.reduce((pv, cv) => pv.chain(cv), this)
		)(bodyParsers);
	}
}

Request.fromBuffer = _.compose(
	Request,
	utils.fToObj(
		[
			'httpVersion',
			'method',
			'uri',
			'queryParams',
			'headers',
			'body'
		],
		[
			utils.parseHttpVersion,
			utils.parseMethod,
			utils.parseUri,
			utils.parseQueryString,
			utils.parseHeaders,
			utils.preParseBody
		]
	)
);

module.exports = Request;
