<script lang="ts">
import { getContext } from "svelte";
import type { LayerCake } from "layercake";

const { padding, xScale, width, height } = getContext<LayerCake>("LayerCake");

type Props = {
	// Extend gridlines across the chart
	gridlines?: boolean;

	// A function to format the tick values
	formatTick?: (d: number) => string;

	// Approximate number of ticks to use
	tickCount?: number;

	// Size of the tick marks
	tickSize?: number;

	// Degrees to rotate each label
	labelRotation?: number;
};

const {
	gridlines = false,
	formatTick = (d) => String(d),
	tickCount = 10,
	tickSize = 6,
	labelRotation = 0,
}: Props = $props();

const tickVals = $derived($xScale.ticks(tickCount));
</script>

<g class="axis x-axis" transform="translate(0,{$height})">
  <g class="tick-marks">
    {#each tickVals as tick, index (index)}
      <g class="tick" transform="translate({$xScale(tick)},{0})">
        <line y1={0} y2={tickSize}></line>
        {#if gridlines === true}
          <line class="gridline" y1={0} y2={-$height}></line>
        {/if}
        <text
          y={tickSize + 9}
          dx="0em"
          transform="rotate({labelRotation} 0 {tickSize + 9})"
          text-anchor="middle"
        >{formatTick(tick)}</text>
      </g>
    {/each}
  </g>
  <path class="baseline" d="M{$padding.left},{0.5}H{$width}"></path>
</g>

<style>
  .tick line {
    stroke: #aaa;
    stroke-width: 1px;
  }
  .tick text {
    fill: #666;
    font-size: 12px;
  }
  .tick .gridline {
    stroke-dasharray: 2,2;
    stroke: #ddd;
  }
  .baseline {
    stroke: #aaa;
    stroke-width: 1px;
  }
</style>
