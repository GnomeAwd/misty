<script lang="ts">
	import { page } from '$app/stores';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';

	let { data } = $props<{ data?: any }>();

	interface BreadcrumbItem {
		label: string;
		href?: string;
		current?: boolean;
	}

	let breadcrumbs = $state<BreadcrumbItem[]>([]);

	function generateBreadcrumbs(pathname: string, pageData: any): BreadcrumbItem[] {
		const segments = pathname.split('/').filter(Boolean);
		const crumbs: BreadcrumbItem[] = [];

		if (segments.length === 0) {
			return [{ label: 'Home', current: true }];
		}

		if (segments[0] === 'albums') {
			crumbs.push({ label: 'Albums', href: '/albums' });

			if (segments.length > 1) {
				if (pageData?.album && pageData?.artist) {
					const album = pageData.album;
					const artist = pageData.artist;

					crumbs.push({
						label: artist.name || 'Unknown Artist',
						href: `/artists/${artist.id}`
					});

					crumbs.push({
						label: album.title || album.name || 'Unknown Album',
						current: true
					});
				} else {
					crumbs.push({
						label: 'Album',
						current: true
					});
				}
			}
		} else if (segments[0] === 'artists') {
			crumbs.push({ label: 'Artists', href: '/artists' });

			if (segments.length > 1) {
				if (pageData?.artist) {
					crumbs.push({
						label: pageData.artist.name || 'Unknown Artist',
						current: true
					});
				} else {
					crumbs.push({
						label: 'Artist',
						current: true
					});
				}
			}
		} else if (segments[0] === 'library') {
			crumbs.push({ label: 'Library', current: true });
		} else if (segments[0] === 'playlists') {
			crumbs.push({ label: 'Playlists', href: '/playlists' });

			if (segments.length > 1) {
				crumbs.push({ label: 'Playlist', current: true });
			}
		} else if (segments[0] === 'search') {
			crumbs.push({ label: 'Search', current: true });
		} else if (segments[0] === 'favorites') {
			crumbs.push({ label: 'Favorites', current: true });
		} else if (segments[0] === 'recent') {
			crumbs.push({ label: 'Recently Played', current: true });
		} else {
			// Fallback for unknown routes
			crumbs.push({ label: segments[0] || 'Home', current: true });
		}

		return crumbs;
	}

	$effect(() => {
		const pageData = $page.data || data;
		breadcrumbs = generateBreadcrumbs($page.url.pathname, pageData);
	});
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#each breadcrumbs as crumb, index}
			<Breadcrumb.Item>
				{#if crumb.current}
					<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
				{:else if crumb.href}
					<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
				{:else}
					<span>{crumb.label}</span>
				{/if}
			</Breadcrumb.Item>

			{#if index < breadcrumbs.length - 1}
				<Breadcrumb.Separator />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
