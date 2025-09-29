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

	// const fetchFn = event?.fetch || fetch;
	// const res = await fetchFn(sanitizeUrl(url), {
	let res: Response;
	try {
		res = await fetch(sanitizeUrl(url), {
			headers: headers(accessToken, event),
			credentials: 'include'
		});
	} catch (error) {
		console.error('Error fetching', error);
		throw error;
	}

	await gatherCookies(res, event);

	return await respond(res);
}

export async function submit(url: string, data: any, update = false, event?: RequestEvent) {
	const accessToken = event?.locals?.session?.data?.accessToken ?? '';

	// const fetchFn = event?.fetch || fetch;
	// const res = await fetchFn(sanitizeUrl(url), {
	let res: Response;
	try {
		res = await fetch(sanitizeUrl(url), {
			method: update ? 'PUT' : 'POST',
			headers: headers(accessToken, event),
			body: JSON.stringify(data),
			credentials: 'include'
		});
	} catch (error) {
		console.error('Error fetching', error);
		throw error;
	}

	await gatherCookies(res, event);

	return await respond(res);
}

export async function destroy(url: string, event?: RequestEvent) {
	const accessToken = event?.locals?.session?.data?.accessToken ?? '';

	// const fetchFn = event?.fetch || fetch;
	// const res = await fetchFn(sanitizeUrl(url), {
	let res: Response;
	try {
		res = await fetch(sanitizeUrl(url), {
			method: 'DELETE',
			headers: headers(accessToken, event),
			credentials: 'include'
		});
	} catch (error) {
		console.error('Error fetching', error);
		throw error;
	}

	await gatherCookies(res, event);

	return await respond(res);
}

function headers(accessToken?: string, event?: RequestEvent) {
	const cookieHeader = buildCookieHeaderFromSession(event);

	console.log('cookieHeader', cookieHeader);

	const headers = {
		'x-api-key': APIKEY,
		'Content-Type': 'application/json',
		cookie: cookieHeader
	};
	return accessToken ? { ...headers, Authorization: `Bearer ${accessToken}` } : headers;
}

async function gatherCookies(response: Response, event?: RequestEvent) {
	const newCookies = parseSetCookieFromResponse(response);

	if (!newCookies.some((c) => c.startsWith('guest_uuid='))) {
		const headerUUID = response.headers.get('x-guest-uuid');
		if (headerUUID) {
			newCookies.push(`guest_uuid=${headerUUID}`);
		}
	}

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
