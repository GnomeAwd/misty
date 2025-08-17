<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	let {
	  items,
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
</script>

<Sidebar.Group>
	<Sidebar.Menu>
	  {#each items as item (item.title)}
		  <Sidebar.MenuItem >
			  <Sidebar.MenuButton tooltipContent={item.title} size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground data-[state=open]:px-4">
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              {#if item.icon}
                <item.icon class="h-8 w-8 scale-150 mx-2"/>
              {/if}
              <span class="text-sm">{item.title}</span>
            </a>
          {/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
	  {/each}
	</Sidebar.Menu>
</Sidebar.Group>
