<script lang="ts">
import { LayerCake, Svg } from "layercake";
import { scaleTime } from "d3-scale";
import { format, parseISO } from "date-fns";

import AxisX from "./chart/AxisX.svelte";
import AxisY from "./chart/AxisY.svelte";
import Line from "./chart/Line.svelte";
import Area from "./chart/Area.svelte";
import Legend from "./chart/Legend.svelte";
import Tooltip from "./chart/Tooltip.svelte"; // Add the import
import type { ChartData } from "$lib/server/types";

type Props = {
	data: ChartData;
};

const { data }: Props = $props();

// Transform data for LayerCake
const transformedData = $derived(
	data && data.labels && data.datasets
		? data.labels.map((label, i) => {
				const point: Record<string, unknown> = {
					date: parseDate(label),
					formattedDate: label,
				};

				// Add each dataset's value to the point
				data.datasets.forEach((dataset) => {
					point[dataset.name] = dataset.data[i] || 0;
				});

				return point;
			})
		: [],
);

// Function to parse dates from different formats
function parseDate(dateString: string): Date {
	// Try to parse in different formats
	if (dateString.includes("Week")) {
		// Parse "Week X, YYYY" format
		const match = dateString.match(/Week (\d+), (\d{4})/);
		if (match) {
			const year = parseInt(match[2]);
			const week = parseInt(match[1]);
			// Create a rough date for the week (not exact)
			const date = new Date(year, 0, 1 + (week - 1) * 7);
			return date;
		}
	} else if (dateString.includes(" ")) {
		// Parse "Month YYYY" format (e.g., "January 2023")
		try {
			return new Date(dateString);
		} catch (error) {
			console.error("Error parsing date:", dateString, error);
		}
	} else {
		// Parse ISO format "YYYY-MM-DD"
		try {
			return parseISO(dateString);
		} catch (error) {
			console.error("Error parsing ISO date:", dateString, error);
		}
	}

	// Fallback to current date if all parsing fails
	return new Date();
}

const seriesNames = $derived(data.datasets.map((d) => d.name));
const colors = $derived(data.datasets.map((d) => d.color));

const xKey = "date";
const yKey = $derived(seriesNames);
</script>

<div class="chart-wrapper">
  {#if transformedData.length > 0}
    <LayerCake
      data={transformedData}
      x={xKey}
      y={yKey}
      yDomain={[0, null]}
      xScale={scaleTime()}
      padding={{ top: 20, right: 100, bottom: 40, left: 60 }}
    >
      <Svg>
        <AxisX
          gridlines={true}
          formatTick={(d) => {
            const date = new Date(d);
            return format(date, 'MMM d');
          }}
        />
        <AxisY gridlines={true} />

        {#each seriesNames as series, i (i)}
          <Area
            key={series}
            color={colors[i]}
            opacity={0.2}
          />
          <Line
            key={series}
            color={colors[i]}
          />
        {/each}
      </Svg>

      <div class="legend-container">
        <Legend {seriesNames} {colors} />
      </div>

      <!-- Add the tooltip component -->
      <Tooltip {seriesNames} {colors} />
    </LayerCake>
  {/if}
</div>

<style>
  .chart-wrapper {
    height: 500px;
    width: 100%;
    position: relative;
  }

  .legend-container {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #eee;
  }
</style>
