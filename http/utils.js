'use strict';

const _ = require('ramda');

const bufferToText = _.compose(_.split('\n'), _.toString);

const firstLine = _.compose(_.head, bufferToText);

const parseHttpVersion = _.compose(
	_.head,
	_.drop(1),
	_.match(/HTTP\/(\d\.\d)/),
	firstLine
);

const parseMethod = _.compose(_.head, _.match(/^(GET|PUT|POST|DELETE|PATCH|OPTIONS|HEAD|TRACE|CONNECT)+/g), firstLine);

const parseUri = _.compose(_.head, _.match(/\/[/\w_\.-]*\/?/), firstLine);

const parseQueryString = _.compose(
	_.map(decodeURI),
	_.fromPairs,
	_.map(_.split('=')),
	_.match(/[^&?]*?=[^&? ]*/g),
	firstLine
);

const parseHeaders = _.compose(
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

const preParseBody = _.compose(
	_.join('\n'),
	_.takeLastWhile(l => l !== ''),
	_.dropLast(1),
	bufferToText
);

exports.parseHttpVersion = parseHttpVersion;
exports.parseMethod = parseMethod;
exports.parseUri = parseUri;
exports.parseQueryString = parseQueryString;
exports.parseHeaders = parseHeaders;
exports.preParseBody = preParseBody;

exports.jsonParse = b => {
	try {
		let body = JSON.parse(b);

		body.toString = () => {
			return JSON.stringify(body);
		}

		return body;
	} catch (ex) {
		return null;
	}
}

exports.fToObj = _.curry(
	function (props, funcs, data) {
		let o = {};

		for (let i = 0; i < props.length; i++) {
			o[props[i]] = funcs[i](data);
		}

		return o;
	}
)

exports.log = fn => {
	console.log(fn);
	return fn;
}

exports.respond = _.curry((formatters, o) => o.respond(formatters));

exports.parse = _.curry((bodyParsers, o) => o.parse(bodyParsers));