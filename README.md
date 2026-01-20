To install beacon:

```bash
npm install lyre-beacon
pnpm install lyre-beacon
```

You need these in your .env

```bash
APIKEY=
REBASEURL=
BASEURL=
PUBLIC_BASEURL=
SESSION_SECRET=
```

Put this inside `src/hooks.server.ts`

```js
import { handle as beaconHandle } from 'beacon/server';

export const handle = beaconHandle;
```

Put these inside your `src/app.d.ts`

```js
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

export { };
```

Put these inside `src/routes/x-api/base/+server.ts`

```js
import { xAPIHandler } from "beacon/server";

export const POST = xAPIHandler;
```