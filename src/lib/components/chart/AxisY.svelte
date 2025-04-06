<script lang="ts">
import { getContext } from 'svelte'
import type { LayerCake } from 'layercake'

const { xRange, yScale, width } = getContext<LayerCake>('LayerCake')

type Props = {
  // Show marks next to the tick label.
  tickMarks?: boolean

  // Whether the label sits even with its value ('even') or sits on top ('above') the tick mark.
  labelPosition?: 'even' | 'above'

  // When labelPosition='even', adjust the lowest label so that it sits above the tick mark.
  snapBaselineLabel?: boolean

  // Show gridlines extending into the chart area.
  gridlines?: boolean

  // The length of the tick mark.
  tickMarkLength?: number

  // A function that passes the current tick value and expects a nicely formatted value in return.
  format?: (d: unknown) => string

  // If this is a number, it passes that along to the d3Scale.ticks function.
  // If this is an array, hardcodes the ticks to those values.
  // If it's a function, passes along the default tick values and expects an array of tick values in return.
  ticks?: number | number[] | ((d: number[]) => number[])

  // The amount of whitespace between the start of the tick and the chart drawing area (the xRange min).
  tickGutter?: number

  // Any optional value passed to the `dx` attribute on the text label.
  dx?: number

  // Any optional value passed to the `dy` attribute on the text label.
  dy?: number

  // Used to calculate the widest label length to offset labels.
  charPixelWidth?: number
}

const {
  tickMarks = false,
  labelPosition = 'even',
  snapBaselineLabel = false,
  gridlines = true,
  tickMarkLength = undefined,
  format = (d) => String(d),
  ticks = 4,
  tickGutter = 0,
  dx = 0,
  dy = 0,
  charPixelWidth = 7.25,
}: Props = $props()

function calcStringLength(sum: number, val: string): number {
  if (val === ',' || val === '.') return sum + charPixelWidth * 0.5
  return sum + charPixelWidth
}

const isBandwidth = $derived(typeof $yScale.bandwidth === 'function')

const tickVals: number[] = $derived(
  Array.isArray(ticks)
    ? ticks
    : isBandwidth
      ? $yScale.domain()
      : typeof ticks === 'function'
        ? ticks($yScale.ticks())
        : $yScale.ticks(ticks),
)

const widestTickLen = $derived(
  Math.max(
    10,
    Math.max(
      ...tickVals.map((d) =>
        format(d).toString().split('').reduce(calcStringLength, 0),
      ),
    ),
  ),
)

const tickLen = $derived(
  tickMarks === true
    ? labelPosition === 'above'
      ? (tickMarkLength ?? widestTickLen)
      : (tickMarkLength ?? 6)
    : 0,
)

const x1 = $derived(
  -tickGutter - (labelPosition === 'above' ? widestTickLen : tickLen),
)
const y = $derived(isBandwidth ? $yScale.bandwidth() / 2 : 0)

const maxTickValPx = $derived(Math.max(...(tickVals.map($yScale) as number[])))
</script>

<g class="axis y-axis">
  {#each tickVals as tick (tick)}
    {@const tickValPx = $yScale(tick)}
    <g class="tick tick-{tick}" transform="translate({$xRange[0]}, {tickValPx})">
      {#if gridlines === true}
        <line class="gridline" x1={x1} x2={$width} y1={y} y2={y} />
      {/if}
      {#if tickMarks === true}
        <line class="tick-mark" x1={x1} x2={x1 + tickLen} y1={y} y2={y} />
      {/if}
      <text
        x={x1}
        y={y}
        dx={dx + (labelPosition === 'even' ? -3 : 0)}
        text-anchor={labelPosition === 'above' ? 'start' : 'end'}
        dy={dy +
          (labelPosition === 'above' || (snapBaselineLabel === true && tickValPx === maxTickValPx)
            ? -3
            : 4)}
      >
        {format(tick)}
      </text>
    </g>
  {/each}
</g>

<style>
  .tick {
    font-size: 11px;
  }

  .tick line {
    stroke: #aaa;
  }
  .tick .gridline {
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }
</style>
