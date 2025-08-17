<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { scan } from '$lib/api/scan';

	let res = $state(null);

	const handleScan = async () => {
		const result = await scan();
		res = result;
	};
</script>

<span>Home</span>
<Button onclick={handleScan}>Scan</Button>

{#if res}
	<pre>{JSON.stringify(res, null, 2)}</pre>
{/if}
