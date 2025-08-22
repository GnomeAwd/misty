<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import type { Icon } from '@tabler/icons-svelte';
	import RotateClockwise from '@tabler/icons-svelte/icons/rotate-clockwise';
	import { scan } from '$lib/api/scan';
	import { Button } from '../ui/button';
	import { toggleMode } from 'mode-watcher';
	import Sun from '@tabler/icons-svelte/icons/sun';
	import Moon from '@tabler/icons-svelte/icons/moon';
	import Heart from '@tabler/icons-svelte/icons/heart';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';

	let {
	
		...restProps
	}:  WithoutChildren<
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
			<Sidebar.MenuItem>
				<div class="mt-4 flex w-full items-center justify-between">
					<Button variant="outline" size="icon">
						<Heart class="h-5 w-5" />
					</Button>
					<Button variant="outline" size="icon">
						<Clock class="h-5 w-5" />
					</Button>
					<Button onclick={handleScan} variant="outline" size="icon">
						<RotateClockwise class="mx-2 h-5 w-5" />
					</Button>

					<Button onclick={toggleMode} variant="outline" size="icon">
						<Sun class="h-5 w-5 rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0" />
						<Moon
							class="absolute h-5 w-5 rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
						/>
						<span class="sr-only">Toggle theme</span>
					</Button>
					<Button variant="outline" size="icon">
						<DotsVertical class="h-5 w-5" />
					</Button>
				</div>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
