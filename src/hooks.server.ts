import { handleSession } from 'svelte-kit-cookie-session';
import { SESSION_SECRET } from '$env/static/private';

export const handle = handleSession(
	{
		secret: SESSION_SECRET,
		rolling: true, // refresh expiry automatically
		expires: 7,
		expires_in: 'days'
	},
	({ event, resolve }) => {
		// event.locals is populated with the session `event.locals.session`

		// Do anything you want here
		return resolve(event);
	}
);
