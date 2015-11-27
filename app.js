'use strict';

let _ = require('ramda');
let HTTP = require('./http');

let bodyParsers = [];

bodyParsers.push(
	new HTTP.BodyParser(['application/json'],
		(b) => {
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
	)
)

let debug = (ver, meth, uri, q, h, b) => {
	let body = {
		httpVersion: ver,
		method: meth,
		uri: uri,
		queryParams: q,
		headers: h,
		body: b,
		toString: () => {
			return JSON.stringify(body);
		}
	}

	return [ver, meth, uri, q, h, body];
}

process.stdin
	.pipe(HTTP(bodyParsers, debug))
	.pipe(process.stdout)
