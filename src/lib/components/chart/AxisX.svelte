<script lang="ts">
import { getContext } from 'svelte'
import type { LayerCake } from 'layercake'

const { xScale, percentRange } = getContext<LayerCake>('LayerCake')

type Props = {
  // Show a vertical mark for each tick.
  tickMarks?: boolean

  // Show gridlines extending into the chart area.
  gridlines?: boolean

  // The length of the tick mark.
  tickMarkLength?: number

  // Show a solid line at the bottom.
  baseline?: boolean

  // Instead of centering the text labels on the first and the last
  // items, align them to the edges of the chart.
  snapLabels?: boolean

  // A function that passes the current tick value and expects a nicely
  format?: (d: unknown) => string

  // If this is a number, it passes that along to the
  ticks?: number | number[] | ((d: number[]) => number[])

  // If this is an array, hardcodes the ticks to those values.
  tickGutter?: number

  // If it's a function, passes along the default tick values
  dx?: number

  // If nothing, it uses the default ticks supplied by the D3 function.
  dy?: number

  units?: string
}

const {
  tickMarks = false,
  gridlines = true,
  tickMarkLength = 6,
  baseline = false,
  snapLabels = false,
  format = (d) => String(d),
  ticks = undefined,
  tickGutter = 0,
  dx = 0,
  dy = 12,
  units = $percentRange === true ? '%' : 'px',
}: Props = $props()

const tickLen = $derived(tickMarks === true ? (tickMarkLength ?? 6) : 0)

const isBandwidth = $derived(typeof $xScale.bandwidth === 'function')

const tickVals = $derived(
  Array.isArray(ticks)
    ? ticks
    : isBandwidth
      ? $xScale.domain()
      : typeof ticks === 'function'
        ? ticks($xScale.ticks())
        : $xScale.ticks(ticks),
)

const halfBand = $derived(isBandwidth ? $xScale.bandwidth() / 2 : 0)
</script>

<div class="axis x-axis" class:snapLabels>
  {#each tickVals as tick, i (tick)}
    {@const tickValUnits = $xScale(tick)}

    {#if baseline === true}
      <div class="baseline" style="top:100%; width:100%;"></div>
    {/if}

    {#if gridlines === true}
      <div class="gridline" style:left="{tickValUnits}{units}" style="top:0; bottom:0;"></div>
    {/if}
    {#if tickMarks === true}
      <div
        class="tick-mark"
        style:left="{tickValUnits + halfBand}{units}"
        style:height="{tickLen}px"
        style:bottom="{-tickLen - tickGutter}px"
      ></div>
    {/if}
    <div
      class="tick tick-{i}"
      style:left="{tickValUnits + halfBand}{units}"
      style="top:calc(100% + {tickGutter}px);"
    >
      <div
        class="text"
        style:top="{tickLen}px"
        style:transform="translate(calc(-50% + {dx}px), {dy}px)"
      >
        {format(tick)}
      </div>
    </div>
  {/each}
</div>

<style>
  .axis,
  .tick,
  .tick-mark,
  .gridline,
  .baseline {
    position: absolute;
  }
  .axis {
    width: 100%;
    height: 100%;
  }
  .tick {
    font-size: 11px;
  }

  .gridline {
    border-left: 1px dashed #aaa;
  }

  .tick-mark {
    border-left: 1px solid #aaa;
  }
  .baseline {
    border-top: 1px solid #aaa;
  }

  .tick .text {
    color: #666;
    position: relative;
    white-space: nowrap;
    transform: translateX(-50%);
  }
  /* This looks a little better at 40 percent than 50 */
  .axis.snapLabels .tick:last-child {
    transform: translateX(-40%);
  }
  .axis.snapLabels .tick.tick-0 {
    transform: translateX(40%);
  }
</style>
