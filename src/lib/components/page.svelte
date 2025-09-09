<script lang="ts">
	import { page } from '$app/state';
	import Base from '$lib/components/base.svelte';

	let { slug } = $props();

	let base = page.data.pages.find((page: Page) => page.slug === slug);
</script>

<Base {base} />
