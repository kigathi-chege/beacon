<script lang="ts">
	import { canAny } from '$lib/rbac';
	import { authenticatedUser } from '$lib/store';

	export let permission: string | string[];

	let is = false;

	$: if ($authenticatedUser) {
		is = canAny(permission);
	}
</script>

{#if is}
	<slot />
{/if}
