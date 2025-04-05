<script lang="ts">
import { getContext } from "svelte";
import { area } from "d3-shape";
import type { LayerCake } from "layercake";

const { data, xGet, yGet, height } = getContext<LayerCake>("LayerCake");

type Props = {
	// The key in the data that corresponds to this area
	key?: string;

	// The color of the area
	color?: string;

	// The opacity of the area
	opacity?: number;
};

const { key = undefined, color = "#ab00d6", opacity = 0.2 }: Props = $props();

const path = $derived(
	area()
		.x((d) => $xGet(d))
		.y1((d) => $yGet(d, key))
		.y0($height),
);
</script>

<path
  class='path-area'
  d='{path($data)}'
  fill='{color}'
  opacity='{opacity}'
></path>

<style>
  .path-area {
    stroke: none;
  }
</style>
