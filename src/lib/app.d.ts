import type { Session } from 'svelte-kit-cookie-session';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

type SessionData = {
	accessToken: string;
	user: {
		id: number;
		name: string;
		email: string;
		is_guest: boolean;
	} | null;
	laravelCookies?: string[];
};

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session<SessionData>;
		}
		interface PageData {
			// can add any properties here, return it from your root layout
			session: SessionData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
