// import { toast } from 'svelte-sonner';
// import { loading } from './store';

export const toImageUrl = (processedImagePath: string) =>
	`url('${processedImagePath.replaceAll('\\', '/')}')`;

export function sanitizeUrl(url: string) {
	const [base, query] = url.split('?');
	const sanitizedBase = base.replace(/\/$/, '') + '/';
	return query ? `${sanitizedBase}?${query}` : sanitizedBase;
}

export function buildFullUrl(
	url: string,
	params: Record<string, any> = {},
	baseUrl = null
): string {
	let fullUrl = url;

	if (!/^https?:\/\//i.test(url) && baseUrl) {
		fullUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
	}

	return buildUrlWithQueryParams(fullUrl, params);
}

export function buildUrlWithQueryParams(url: string, params: Record<string, any>): string {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (key === 'orderByColumn' || key === 'orderByOrder') {
			// Handled together later
			continue;
		}

		if (value !== undefined && value !== null) {
			query.set(key, String(value));
		}
	}

	if (params.orderByColumn && params.orderByOrder) {
		query.set('order', `${params.orderByColumn},${params.orderByOrder}`);
	}

	return `${url}?${query.toString()}`;
}

export function featuredFileSm(url: string) {
	return getFileVariant(url, 'sm');
}

export function featuredFileMd(url: string) {
	return getFileVariant(url, 'md');
}

export function featuredFileLg(url: string) {
	return getFileVariant(url, 'lg');
}

function getFileVariant(url: string, variant = 'sm') {
	if (!url) return url;
	return `${url}?variant=md`;
}

export function wrapNoArgFunc(func: any, args: any[]) {
	return () => func(...args);
}

export function getTextFromSection(section: Section | null, name: string) {
	return section?.texts?.find((text: iText) => text.name === name);
}

export function getButtonFromSection(section: Section | null, name: string) {
	return section?.buttons?.find((button: iButton) => button.name === name);
}

export function formatDate(date: string) {
	return new Date(date).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

export function formatTime(date: string) {
	return new Date(date).toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
}

export function directRetrieve(url: string) {
	return fetch(url, { credentials: 'include' });
}

type iLocalFetch = {
	method: string;
	data: any;
	params: Record<string, any>;
	success?: (data: any) => void;
	error?: (errors: any) => void;
};

const defaultLocalFetch: iLocalFetch = {
	method: 'GET',
	data: null,
	params: {}
};

export async function localFetch(url: string, options?: Partial<iLocalFetch>) {
	const config: iLocalFetch = {
		...defaultLocalFetch,
		...options
	};

	let res = await fetch('/x-api/base', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ url, ...config })
	});

	const data = await respond(res);

	if (config.success && typeof config.success === 'function') {
		config.success(data);
	}

	return data;
}

export async function respond(response: Response) {
	if (response.ok) {
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const text = await response.text();
			try {
				const data = text ? JSON.parse(text) : null;
				return data;
			} catch (e) {
				console.error('Invalid JSON response', text);
				throw e;
			}
		}
		return true;
	} else {
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			try {
				const errorData = await response.json();
				throw errorData;
			} catch (e) {
				console.error('Failed to parse error response as JSON', e);
				throw { error: 'Request failed', status: response.status, statusText: response.statusText };
			}
		} else {
			const text = await response.text();
			console.error('Non-JSON error response:', text);
			throw {
				error: 'Request failed',
				status: response.status,
				statusText: response.statusText,
				body: text
			};
		}
	}
}

// export function handleLogout() {
// 	loading.set(true);

// 	toast.promise(
// 		localFetch('logout', {
// 			method: 'POST',
// 			success: () => (loading.set(false), (window.location.href = '/'))
// 		}),
// 		{
// 			loading: 'Logging out',
// 			success: 'Logged out successfully',
// 			error: 'Failed to log out'
// 		}
// 	);
// }

export function getMenuItems(menu: iMenu[], name: string) {
	return menu.find((item: iMenu) => item.name === name)?.filtered_menu_items;
}

import parse from 'set-cookie-parser';
import type { RequestEvent } from '@sveltejs/kit';

export function parseSetCookieFromResponse(res: Response) {
	// Try to get the raw array first (Node fetch variants provide headers.raw())
	// @ts-ignore
	const rawArray = (res.headers as any)?.raw?.()['set-cookie'];

	let arr: string[] = [];

	if (Array.isArray(rawArray) && rawArray.length) {
		// Good: already separated
		arr = rawArray;
	} else {
		// Fallback: headers.get may return a single string with multiple cookies
		const single = res.headers.get('set-cookie') ?? '';
		if (!single) return [];

		// splitCookiesString correctly splits cookies while respecting Expires commas
		// (set-cookie-parser exports splitCookiesString)
		arr = parse.splitCookiesString(single);
	}

	// parse accepts an array and returns objects with name/value/attrs
	const parsed = parse.parse(arr);

	// return only name=value pairs (suitable for Cookie request header)
	return parsed.map((c: { name: string; value: string }) => `${c.name}=${c.value}`);
}

export function buildCookieHeaderFromSession(event?: RequestEvent) {
	const stored = event?.locals?.session?.data?.laravelCookies ?? [];
	return stored.length ? (stored as string[]).join('; ') : '';
}
