<script lang="ts">
import { getContext } from "svelte";
import type { LayerCake } from "layercake";

const { xScale, yScale, height } = getContext<LayerCake>("LayerCake");

type Props = {
	// Extend gridlines across the chart
	gridlines?: boolean;

	// A function to format the tick values
	formatTick?: (d: number) => string;

	// Approximate number of ticks to use
	tickCount?: number;

	// Size of the tick marks
	tickSize?: number;
};

const {
	gridlines = false,
	formatTick = (d) => String(d),
	tickCount = 5,
	tickSize = 6,
}: Props = $props();

const tickVals = $derived($yScale.ticks(tickCount));
</script>

<g class="axis y-axis">
  <g class="tick-marks">
    {#each tickVals as tick, index (index)}
      <g class="tick" transform="translate(0, {$yScale(tick)})">
        <line x2={-tickSize} y1={0} y2={0}></line>
        {#if gridlines === true}
          <line class="gridline" x2={$xScale.range()[1]} y1={0} y2={0}></line>
        {/if}
        <text x={-tickSize - 8} y={0} dx="0em" dy="0.32em" text-anchor="end">{formatTick(tick)}</text>
      </g>
    {/each}
  </g>
  <path
    class="baseline"
    d="M{-1 * tickSize},{0.5}V{$height}"
  ></path>
</g>

<style>
  .tick line {
    stroke: #aaa;
    stroke-width: 1px;
  }
  .tick .gridline {
    stroke-dasharray: 2,2;
    stroke: #ddd;
  }
  .tick text {
    fill: #666;
    font-size: 12px;
  }
  .baseline {
    stroke: #aaa;
    stroke-width: 1px;
  }
</style>
