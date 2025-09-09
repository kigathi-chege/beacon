import { BASEURL } from '$env/static/private';
import { retrieve } from '$lib/server/utils.js';

/** @type {import('@sveltejs/kit').LayoutServerLoad} */
export async function load(event) {
	let userUrl = `${BASEURL}/user`;

	console.log('UREL', userUrl);

	const { result: user } = await retrieve(userUrl, event);

	// event.locals.session.set({
	// 	accessToken: user.token ?? event.locals.session.data.accessToken ?? '',
	// 	user: user
	// 		? {
	// 				id: user.id,
	// 				name: user.name,
	// 				email: user.email,
	// 				is_guest: user.is_guest
	// 			}
	// 		: null
	// });

	// return { session: event.locals.session.data, user };

	console.log('USER', user);

	return user;
}
