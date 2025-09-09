import { writable } from 'svelte/store';

export const authenticatedUser = writable<User | null>(null);

export const subscribeNowBanner = writable<boolean>(true);

export const subscribeTo = writable<string | null>(null);

export const loading = writable<boolean>(false);
