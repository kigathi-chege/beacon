<script lang="ts">
	import { page } from '$app/state';
	import { can } from '$lib/rbac';
	import { authenticatedUser } from '$lib/store';

	export let permission: string | string[];

	let is = false;

	$: if ($authenticatedUser) {
		is = can(permission);
	}
</script>

{#if is}
	<slot />
{/if}
