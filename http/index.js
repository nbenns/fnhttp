'use strict';

const es = require('event-stream'),
		_ = require('ramda'),
		utils = require('./utils'),
		Request = require('./request'),
		Response = require('./response');

const HTTP = (bodyParsers, formatters, routes) => {
	const httpChain = _.compose(
		utils.respond(formatters),
		_.chain(req => Response.ImATeapot({}, req.body, req)),
		_.map(routes),
		utils.parse(bodyParsers),
		Request.fromBuffer
	);
	
  return es.map((data, cb) => {
		const callback = _.curry(cb);
		
		_.compose(
			callback(null),
			httpChain
		)(data);
  });
}

const BodyParser = function (contentTypes, parser) {
	const getContentType = _.compose(_.prop('content-type'), _.prop('headers'))
	const createParsedRequest = _.compose(
		_.ifElse(
			_.compose(
				_.isNil,
				_.prop('body')
			),
			Response.BadRequest({}, "Unable to parse request body"),
			Request
		),
		_.over(_.lensProp('body'), parser)
	);
	
	return req => {
		if (_.contains(getContentType(req), contentTypes)) {
			return createParsedRequest(req);
		}	else {
			return Request(req);
		}
	}
}

HTTP.Request = Request;
HTTP.Response = Response;
HTTP.BodyParser = BodyParser;

module.exports = HTTP;
