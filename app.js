'use strict';

const _ = require('ramda'),
		HTTP = require('./http'),
		utils = require('./http/utils');

const bodyParsers = [];

bodyParsers.push(HTTP.BodyParser(['application/json'], utils.jsonParse));
bodyParsers.push(HTTP.BodyParser(['text/plain'], b => b));

const formatters = [];

const debug = (req) => {
	req.body = {
		httpVersion: req.httpVersion,
		method: req.method,
		uri: req.uri,
		queryParams: req.queryParams,
		headers: req.headers,
		body: req.body,
		toString: () => {
			return JSON.stringify(req.body);
		}
	}

	return req;
}

process.stdin
	.pipe(HTTP(bodyParsers, formatters, debug))
	.pipe(process.stdout)
