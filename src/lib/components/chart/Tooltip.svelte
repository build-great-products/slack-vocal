<script lang="ts">
import { getContext } from "svelte";
import { pointer } from "d3-selection";
import { format } from "date-fns";
import type { LayerCake } from "layercake";

const { data, xGet, xScale } = getContext<LayerCake>("LayerCake");

type Props = {
	// Names of the series in the chart
	seriesNames?: string[];

	// Colors for each series
	colors?: string[];
};

const { seriesNames = [], colors = [] }: Props = $props();

let tooltip = $state({ visible: false, x: 0, y: 0, data: null });
let svgElement = $state();
let closestIndex = $state(-1);

function handleMousemove(event: MouseEvent) {
	const [xPos] = pointer(event, svgElement);

	// Find the closest data point
	const xInverse = $xScale.invert(xPos);

	closestIndex = $data.reduce((closest, d, i) => {
		const date = $xGet(d);
		const currentDistance = Math.abs(date - xInverse);
		const closestDistance = Math.abs($xGet($data[closest]) - xInverse);

		return currentDistance < closestDistance ? i : closest;
	}, 0);

	if (closestIndex >= 0) {
		const d = $data[closestIndex];
		tooltip = {
			visible: true,
			x: $xGet(d),
			y: 0, // We'll display values for all series
			data: {
				date: format(new Date($xGet(d)), "MMM d, yyyy"),
				values: seriesNames.map((name, i) => ({
					name,
					value: d[name] || 0,
					color: colors[i],
				})),
			},
		};
	}
}

function handleMouseleave() {
	tooltip.visible = false;
	closestIndex = -1;
}
</script>

<div bind:this={svgElement} class="tooltip-container">
  <div
    class="tooltip-overlay"
    onmousemove={handleMousemove}
    onmouseleave={handleMouseleave}
  ></div>

  {#if tooltip.visible && closestIndex >= 0}
    <div
      class="tooltip"
      style="transform: translate({$xScale(tooltip.x)}px, 0);"
    >
      <div class="tooltip-line"></div>

      <div class="tooltip-content">
        <div class="tooltip-date">{tooltip.data.date}</div>
        {#each tooltip.data.values as value, index (index)}
          <div class="tooltip-value">
            <span
              class="tooltip-color-box"
              style="background-color: {value.color};"
            ></span>
            <span class="tooltip-series-name">{value.name}:</span>
            <span class="tooltip-value-text">{value.value}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .tooltip-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .tooltip-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: all;
  }

  .tooltip {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }

  .tooltip-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.3);
    left: 0;
  }

  .tooltip-content {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    white-space: nowrap;
  }

  .tooltip-date {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .tooltip-value {
    display: flex;
    align-items: center;
    margin-top: 2px;
  }

  .tooltip-color-box {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
  }

  .tooltip-series-name {
    margin-right: 5px;
  }

  .tooltip-value-text {
    font-weight: bold;
  }
</style>
