<script>
	import { SiteHeader } from '$lib/components/site-header';
	let { children } = $props();
</script>

<SiteHeader />
{@render children?.()}
