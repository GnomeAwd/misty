<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import { page } from '$app/stores';
	import ChevronLeft from '@tabler/icons-svelte/icons/chevron-left';
	let {
		items
	}: {
		items: {
			title: string;
			url: string;
			// this should be `Component` after @lucide/svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon?: any;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
	} = $props();

	const activeFor = (itemUrl: string, pathname: string) => {
		const clean = (s: string) => s.replace(/\/$/, '');
		const a = clean(itemUrl);
		const p = clean(pathname);
		return p === a || (a !== '' && p.startsWith(a + '/'));
	};
</script>

<Sidebar.Group>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					tooltipContent={item.title}
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[state=open]:px-4"
				>
					{#snippet child({ props })}
						<a href={item.url} {...props} class="flex w-full items-center justify-between">
							<div class="flex items-center justify-center gap-2 p-2">
								{#if item.icon}
									<item.icon class="mx-2 h-6 w-6" />
								{/if}

								<span class="text-sm">{item.title}</span>
							</div>
							{#if activeFor(item.url, $page.url.pathname)}
								<ChevronLeft class="h-4 w-4" />
							{/if}
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
