<script lang="ts">
	import { localFetch, localFetchFormData } from '$lib/utils';

	let {
		value = $bindable([]),
		multiple = false,
		label = 'Select Image'
	}: {
		value?: any[];
		multiple?: boolean;
		label?: string;
	} = $props();

	let open = $state(false);
	let files = $state<any[]>([]);
	let loading = $state(false);
	let uploading = $state(false);
	let page = $state(1);
	let meta = $state<any>(null);

	const selectedFiles = $derived(multiple ? value : value.length > 0 ? [value[0]] : []);

	async function loadFiles() {
		loading = true;
		try {
			const response = await localFetch('files', {
				params: { page, per_page: 12, order: 'created_at,desc' }
			});
			files = response.data;
			meta = response.meta;
		} finally {
			loading = false;
		}
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		uploading = true;
		try {
			const formData = new FormData();
			formData.append('file', input.files[0]);
			formData.append('name', input.files[0].name);
			const response = await localFetchFormData('files', formData);
			await loadFiles();
			selectFile(response);
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	function selectFile(file: any) {
		if (multiple) {
			const exists = value.some((f) => f.id === file.id);
			value = exists ? value.filter((f) => f.id !== file.id) : [...value, file];
		} else {
			value = [file];
			open = false;
		}
	}

	function removeFile(file: any) {
		value = value.filter((f) => f.id !== file.id);
	}

	function isSelected(file: any) {
		return value.some((f) => f.id === file.id);
	}

	$effect(() => {
		if (open) loadFiles();
	});
</script>

<div class="sfg-field">
	{#if label}
		<label class="sfg-label">{label}</label>
	{/if}

	<button type="button" class="sfg-trigger" onclick={() => (open = true)}>
		{#if selectedFiles.length > 0}
			<div class="sfg-selected-list">
				{#each selectedFiles as file}
					<div class="sfg-selected-item">
						<img src={file.link} alt={file.name} class="sfg-thumb" />
						<button
							type="button"
							class="sfg-remove"
							onclick={(e) => { e.stopPropagation(); removeFile(file); }}
						>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<svg class="sfg-thumb sfg-placeholder" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect width="64" height="64" rx="6" fill="currentColor" opacity="0.1"/>
				<path d="M20 44l10-12 7 8 5-6 10 10H20z" fill="currentColor" opacity="0.3"/>
				<circle cx="26" cy="26" r="4" fill="currentColor" opacity="0.3"/>
			</svg>
		{/if}
	</button>
</div>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="sfg-backdrop" onclick={() => (open = false)}></div>
	<div class="sfg-dialog" role="dialog" aria-modal="true" aria-label="Select from Gallery">
		<div class="sfg-dialog-header">
			<h2 class="sfg-dialog-title">Select from Gallery</h2>
			<p class="sfg-dialog-desc">Choose an image or upload a new one</p>
		</div>

		<div class="sfg-dialog-body">
			<div class="sfg-upload-row">
				<input
					type="file"
					accept="image/*"
					onchange={handleFileUpload}
					disabled={uploading}
					class="sfg-file-input"
				/>
				{#if uploading}
					<span class="sfg-uploading">Uploading...</span>
				{/if}
			</div>

			{#if loading}
				<div class="sfg-loading">
					<div class="sfg-spinner"></div>
				</div>
			{:else}
				<div class="sfg-grid">
					{#each files as file}
						<button
							type="button"
							class="sfg-grid-item {isSelected(file) ? 'sfg-grid-item--selected' : ''}"
							onclick={() => selectFile(file)}
						>
							<img src={file.link} alt={file.name} class="sfg-grid-img" />
							{#if isSelected(file)}
								<div class="sfg-check-overlay">
									<svg class="sfg-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							{/if}
						</button>
					{/each}
				</div>

				{#if meta && meta.last_page > 1}
					<div class="sfg-pagination">
						<button
							type="button"
							class="sfg-btn"
							disabled={page === 1}
							onclick={() => { page--; loadFiles(); }}
						>Previous</button>
						<span class="sfg-page-info">Page {meta.current_page} of {meta.last_page}</span>
						<button
							type="button"
							class="sfg-btn"
							disabled={page === meta.last_page}
							onclick={() => { page++; loadFiles(); }}
						>Next</button>
					</div>
				{/if}
			{/if}
		</div>

		<div class="sfg-dialog-footer">
			<button type="button" class="sfg-btn" onclick={() => (open = false)}>
				{multiple ? 'Done' : 'Cancel'}
			</button>
		</div>
	</div>
{/if}

<style>
	.sfg-field { display: grid; width: 100%; gap: 0.5rem; }
	.sfg-label { font-size: 0.875rem; font-weight: 500; line-height: 1; }
	.sfg-trigger {
		display: flex; align-items: flex-start; width: 100%; padding: 0.75rem;
		border: 1px solid hsl(var(--border, 214 32% 91%)); border-radius: 0.375rem;
		background: transparent; cursor: pointer; text-align: left;
	}
	.sfg-trigger:hover { background: hsl(var(--accent, 210 40% 96%)); }
	.sfg-selected-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.sfg-selected-item { position: relative; }
	.sfg-thumb { width: 4rem; height: 4rem; border-radius: 0.375rem; object-fit: cover; }
	.sfg-remove {
		position: absolute; top: -0.5rem; right: -0.5rem;
		background: #ef4444; color: white; border: none; border-radius: 9999px;
		padding: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
	}
	.sfg-remove:hover { background: #dc2626; }
	.sfg-backdrop {
		position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50;
	}
	.sfg-dialog {
		position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
		z-index: 51; background: hsl(var(--background, 0 0% 100%));
		border: 1px solid hsl(var(--border, 214 32% 91%)); border-radius: 0.5rem;
		width: min(56rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem);
		overflow-y: auto; display: flex; flex-direction: column;
	}
	.sfg-dialog-header { padding: 1.5rem 1.5rem 0; }
	.sfg-dialog-title { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.25rem; }
	.sfg-dialog-desc { font-size: 0.875rem; color: hsl(var(--muted-foreground, 215 16% 47%)); margin: 0; }
	.sfg-dialog-body { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
	.sfg-dialog-footer { padding: 0 1.5rem 1.5rem; display: flex; justify-content: flex-end; }
	.sfg-upload-row { display: flex; align-items: center; gap: 0.5rem; }
	.sfg-file-input { flex: 1; font-size: 0.875rem; }
	.sfg-uploading { font-size: 0.875rem; color: hsl(var(--muted-foreground, 215 16% 47%)); }
	.sfg-loading { display: flex; align-items: center; justify-content: center; min-height: 10rem; }
	.sfg-spinner {
		width: 2rem; height: 2rem; border-radius: 9999px;
		border: 4px solid hsl(var(--primary, 222 47% 11%));
		border-top-color: transparent; animation: sfg-spin 0.7s linear infinite;
	}
	@keyframes sfg-spin { to { transform: rotate(360deg); } }
	.sfg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
	@media (min-width: 768px) { .sfg-grid { grid-template-columns: repeat(4, 1fr); } }
	.sfg-grid-item {
		position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 0.5rem;
		border: 2px solid transparent; cursor: pointer; padding: 0; background: none;
		transition: transform 0.15s, border-color 0.15s;
	}
	.sfg-grid-item:hover { transform: scale(1.05); }
	.sfg-grid-item--selected { border-color: hsl(var(--primary, 222 47% 11%)); }
	.sfg-grid-img { width: 100%; height: 100%; object-fit: cover; }
	.sfg-check-overlay {
		position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
		background: hsl(var(--primary, 222 47% 11%) / 0.2);
	}
	.sfg-check-icon {
		width: 1.5rem; height: 1.5rem; background: hsl(var(--primary, 222 47% 11%));
		color: white; border-radius: 9999px; padding: 0.25rem;
	}
	.sfg-pagination { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
	.sfg-page-info { font-size: 0.875rem; color: hsl(var(--muted-foreground, 215 16% 47%)); }
	.sfg-btn {
		padding: 0.375rem 0.75rem; border: 1px solid hsl(var(--border, 214 32% 91%));
		border-radius: 0.375rem; background: transparent; cursor: pointer; font-size: 0.875rem;
	}
	.sfg-btn:hover:not(:disabled) { background: hsl(var(--accent, 210 40% 96%)); }
	.sfg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
