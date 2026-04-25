import { BASEURL } from '$env/static/private';
import { destroy, retrieve, submit } from '$lib/server/utils';
import { buildUrlWithQueryParams } from '$lib/utils';
import { buildFullUrl } from '$lib/utils.js';
import { json } from '@sveltejs/kit';

export async function xAPIHandler(event) {
	const contentType = event.request.headers.get('content-type') || '';
	const isFormData = contentType.includes('multipart/form-data');

	let url: string;
	let params: Record<string, any> = {};
	let method: string = 'GET';
	let data: any = {};
	let isFormDataRequest = false;

	if (isFormData) {
		const formData = await event.request.formData();
		url = formData.get('_url') as string;
		method = (formData.get('_method') as string) || 'POST';
		isFormDataRequest = true;

		const cleanFormData = new FormData();
		for (const [key, value] of formData.entries()) {
			if (!key.startsWith('_')) {
				cleanFormData.append(key, value);
			}
		}
		data = cleanFormData;
	} else {
		const requestData = await event.request.json();
		url = requestData.url;
		params = requestData.params || {};
		method = requestData.method || 'GET';
		data = requestData.data || {};
	}

	const fullUrl = buildFullUrl(url, params, BASEURL);

	const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
	type Method = (typeof allowedMethods)[number];

	const methodHandlers: Record<Method, () => Promise<any>> = {
		GET: () => retrieve(fullUrl, event),
		POST: () => submit(fullUrl, data, false, event, isFormDataRequest),
		PUT: () => submit(fullUrl, data, true, event, isFormDataRequest),
		PATCH: () => submit(fullUrl, data, true, event, isFormDataRequest),
		DELETE: () => destroy(fullUrl, event)
	};

	if (!allowedMethods.includes(method as Method)) {
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
