<script>
	import { SiteHeader } from '$lib/components/site-header';
	let { children, data } = $props();
</script>

<SiteHeader {data} />
{@render children?.()}
