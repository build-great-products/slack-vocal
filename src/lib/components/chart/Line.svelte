<script lang="ts">
import { getContext } from "svelte";
import { line } from "d3-shape";
import type { LayerCake } from "layercake";

const { data, xGet, yGet } = getContext<LayerCake>("LayerCake");

type Props = {
	// The key in the data that corresponds to this line
	key?: string;

	// The color of the line
	color?: string;

	// The stroke width in pixels
	strokeWidth?: number;
};

const { key = undefined, color = "#ab00d6", strokeWidth = 2 }: Props = $props();

const path = $derived(
	line()
		.x((d) => $xGet(d))
		.y((d) => $yGet(d, key)),
);
</script>

<path
  class='path-line'
  d='{path($data)}'
  stroke='{color}'
  stroke-width='{strokeWidth}'
></path>

<style>
  .path-line {
    fill: none;
  }
</style>
