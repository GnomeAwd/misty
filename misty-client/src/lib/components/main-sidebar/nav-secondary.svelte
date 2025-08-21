<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import type { Icon } from '@tabler/icons-svelte';
	import RotateClockwise from '@tabler/icons-svelte/icons/rotate-clockwise';
	import { scan } from '$lib/api/scan';


	let {
		items,
		...restProps
	}: { items: { title: string; url: string; icon: Icon }[] } & WithoutChildren<
		ComponentProps<typeof Sidebar.Group>
	> = $props();


	let res = $state(null);

	const handleScan = async () => {
		const result = await scan();
		res = result;
		if (result.success === 200) {
			// alert('Scan completed successfully!');
			//reload page
			window.location.reload();
		} else {
			// alert('Scan failed. Please try again.');
		}
	};

</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg"
				class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[state=open]:px-4">
				  {#snippet child({ props })}
					<a href={item.url} {...props}>
					  <item.icon class="h-8 w-8 scale-150 mx-2"/>
					  <span class="text-sm">{item.title}</span>
					</a>
				  {/snippet}
				</Sidebar.MenuButton>
			  </Sidebar.MenuItem>
			{/each}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton onclick={handleScan} size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[state=open]:px-4">
				  <RotateClockwise class="h-8 w-8 scale-150 mx-2" />
				  <span class="text-sm">Rescan</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

