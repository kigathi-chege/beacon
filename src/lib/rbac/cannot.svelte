<script lang="ts">
	import { page } from '$app/state';
	import { cannot } from '$lib/rbac';
	import { authenticatedUser } from '$lib/store';

	export let permission: string | string[];

	let is = false;

	$: if ($authenticatedUser) {
		is = cannot(permission);
	}
</script>

{#if is}
	<slot />
{/if}
