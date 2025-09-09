import { APIKEY, BASEURL } from '$env/static/private';
import {
	sanitizeUrl,
	respond,
	parseSetCookieFromResponse,
	buildCookieHeaderFromSession
} from '$lib/utils';
import type { RequestEvent } from '@sveltejs/kit';

export function generateFileViewUrl(
	file: FeaturedFile,
	variant: FeaturedFileVariant | null = null
) {
	return `${BASEURL}/files/${file.id}/view/${variant ? `?variant=${variant}` : ''}`;
}

export async function retrieve(url: string, event?: RequestEvent) {
	const accessToken = event?.locals?.session?.data?.accessToken ?? '';

	const res = await fetch(sanitizeUrl(url), {
		headers: headers(accessToken, event),
		credentials: 'include'
	});

	await gatherCookies(res, event);

	return await respond(res);
}

export async function submit(url: string, data: any, update = false, event?: RequestEvent) {
	const accessToken = event?.locals?.session?.data?.accessToken ?? '';

	const res = await fetch(sanitizeUrl(url), {
		method: update ? 'PUT' : 'POST',
		headers: headers(accessToken, event),
		body: JSON.stringify(data),
		credentials: 'include'
	});

	return await respond(res);
}

export async function destroy(url: string, event?: RequestEvent) {
	const accessToken = event?.locals?.session?.data?.accessToken ?? '';

	const res = await fetch(sanitizeUrl(url), {
		method: 'DELETE',
		headers: headers(accessToken, event),
		credentials: 'include'
	});

	return await respond(res);
}

function headers(accessToken?: string, event?: RequestEvent) {
	// const storedCookies = event?.locals?.session?.data?.laravelCookies ?? [];

	// const cookieHeader = storedCookies.length ? storedCookies.join('; ') : '';
	// const cookieHeader = storedCookies.length ? normalizeCookies(storedCookies).join('; ') : '';

	const cookieHeader = buildCookieHeaderFromSession(event);

	// console.log('REQUEST COOKIES', cookieHeader);

	const headers = {
		'x-api-key': APIKEY,
		'Content-Type': 'application/json',
		cookie: cookieHeader
	};
	return accessToken ? { ...headers, Authorization: `Bearer ${accessToken}` } : headers;
}

async function gatherCookies(response: Response, event?: RequestEvent) {
	const newCookies = parseSetCookieFromResponse(response);
	console.log('RETRIEVED COOKIES', newCookies);
	if (event) {
		await event.locals.session.update((prev = {}) => {
			const oldCookies = prev.laravelCookies ?? [];

			// Map by cookie name
			const cookieMap = Object.fromEntries(
				oldCookies.map((c) => {
					const [name, value] = c.split('=');
					return [name, value];
				})
			);

			for (const c of newCookies) {
				const [name, value] = c.split('=');
				cookieMap[name] = value; // overwrite or add
			}

			return {
				...prev,
				laravelCookies: Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`)
			};
		});
	}
}
