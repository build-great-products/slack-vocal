<script lang="ts">
import { getContext } from 'svelte'
import type { LayerCake } from 'layercake'

const { width, height, xScale, yRange } = getContext<LayerCake>('LayerCake')

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
}: Props = $props()

function textAnchor(i: number, sl: boolean) {
  if (sl === true) {
    if (i === 0) {
      return 'start'
    }
    if (i === tickVals.length - 1) {
      return 'end'
    }
  }
  return 'middle'
}

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

<g class="axis x-axis" class:snapLabels>
  {#each tickVals as tick, i (tick)}
    {#if baseline === true}
      <line class="baseline" y1={$height} y2={$height} x1="0" x2={$width} />
    {/if}

    <g class="tick tick-{i}" transform="translate({$xScale(tick)},{Math.max(...$yRange)})">
      {#if gridlines === true}
        <line class="gridline" x1={halfBand} x2={halfBand} y1={-$height} y2="0" />
      {/if}
      {#if tickMarks === true}
        <line
          class="tick-mark"
          x1={halfBand}
          x2={halfBand}
          y1={tickGutter}
          y2={tickGutter + tickLen}
        />
      {/if}
      <text x={halfBand} y={tickGutter + tickLen} {dx} {dy} text-anchor={textAnchor(i, snapLabels)}
        >{format(tick)}</text
      >
    </g>
  {/each}
</g>

<style>
  .tick {
    font-size: 11px;
  }

  line,
  .tick line {
    stroke: #aaa;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick .tick-mark,
  .baseline {
    stroke-dasharray: 0;
  }
  /* This looks slightly better */
  .axis.snapLabels .tick:last-child text {
    transform: translateX(3px);
  }
  .axis.snapLabels .tick.tick-0 text {
    transform: translateX(-3px);
  }
</style>
