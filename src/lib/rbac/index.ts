import { get } from 'svelte/store';
import { authenticatedUser } from '$lib/store';

export const can = (permission: string | string[]) => {
	const permissions = get(authenticatedUser)?.all_permissions || [];
	if (Array.isArray(permission)) {
		return permission.every((p) => permissions.includes(p));
	}
	return permissions.includes(permission);
};

export const canAny = (permission: string | string[]) => {
	const permissions = get(authenticatedUser)?.all_permissions || [];
	if (Array.isArray(permission)) {
		return permission.some((p) => permissions.includes(p));
	}
	return permissions.includes(permission);
};

export const cannot = (permission: string | string[]) => {
	const permissions = get(authenticatedUser)?.all_permissions || [];
	if (Array.isArray(permission)) {
		return permission.every((p) => !permissions.includes(p));
	}
	return !permissions.includes(permission);
};
