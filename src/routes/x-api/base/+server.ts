import { BASEURL } from '$env/static/private';
import { destroy, retrieve, submit } from '$lib/server/utils';
import { buildUrlWithQueryParams } from '$lib/utils';
import { json } from '@sveltejs/kit';

export async function POST(event) {
	const { url, params = {}, method = 'GET', data = {} } = await event.request.json();
	const fullUrl = buildUrlWithQueryParams(`${BASEURL}/${url}`, params);

	const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
	type Method = (typeof allowedMethods)[number];

	const methodHandlers: Record<Method, () => Promise<any>> = {
		GET: () => retrieve(fullUrl, event),
		POST: () => submit(fullUrl, data, false, event),
		PUT: () => submit(fullUrl, data, true, event),
		PATCH: () => submit(fullUrl, data, true, event),
		DELETE: () => destroy(fullUrl, event)
	};

	if (!allowedMethods.includes(method)) {
		return json({ error: 'Unsupported method' }, { status: 405 });
	}

	let response = await methodHandlers[method as Method]?.();

	let result = 'result' in response ? response.result : response;

	if (url == 'logout') {
		await event.locals.session.set({
			accessToken: '',
			user: null
		});
	}

	return json(result);
}
