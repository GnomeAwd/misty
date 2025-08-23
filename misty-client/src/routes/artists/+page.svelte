<script>
	import { Button } from "$lib/components/ui/button";
	import Input from "$lib/components/ui/input/input.svelte";

</script>
<div class="flex flex-col items-start justify-start w-full h-[90.5vh] p-4 bg-background">
    <div class="w-full flex items-center justify-between gap-2">
        <Input placeholder="Search" />
        <Button variant="outline">Search</Button>
        <Button variant="outline">Filters</Button>
    </div>
    <div>Grid</div>
</div>

