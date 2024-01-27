'use strict';

const nconf = require('nconf');

const user = require('../user');
const privileges = require('../privileges');

const Controller = module.exports;

Controller.webfinger = async (req, res) => {
	const { resource } = req.query;
	const { host, hostname } = nconf.get('url_parsed');

	if (!resource || !resource.startsWith('acct:') || !resource.endsWith(host)) {
		return res.sendStatus(400);
	}

	const canView = await privileges.global.can('view:users', req.uid);
	if (!canView) {
		return res.sendStatus(403);
	}

	// Get the slug
	const slug = resource.slice(5, resource.length - (host.length + 1));

	let uid = await user.getUidByUserslug(slug);
	if (slug === hostname) {
		uid = 0;
	} else if (!uid) {
		return res.sendStatus(404);
	}

	const response = {
		subject: `acct:${slug}@${host}`,
	};

	if (uid) {
		response.aliases = [
			`${nconf.get('url')}/uid/${uid}`,
			`${nconf.get('url')}/user/${slug}`,
		];

		response.links = [
			{
				rel: 'self',
				type: 'application/activity+json',
				href: `${nconf.get('url')}/uid/${uid}`, // actor
			},
			{
				rel: 'http://webfinger.net/rel/profile-page',
				type: 'text/html',
				href: `${nconf.get('url')}/user/${slug}`,
			},
		];
	} else {
		response.aliases = [nconf.get('url')];
		response.links = [
			{
				rel: 'self',
				type: 'application/activity+json',
				href: `${nconf.get('url')}/actor`, // actor
			},
		];
	}

	res.status(200).json(response);
};