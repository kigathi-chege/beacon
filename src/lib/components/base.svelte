<script lang="ts">
	import { registry } from '$lib/components/registry.js';

	let { base } = $props();

	let pageSections = $derived(() =>
		base.sections.map((section: Section) => ({
			...section,
			component: registry[section.name]
		}))
	);
</script>

{#each pageSections() as section}
	{#if section.component}
		<section.component {section} />
	{/if}
{/each}
