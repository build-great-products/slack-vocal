<script lang="ts">
import { getContext } from 'svelte'
import type { LayerCake } from 'layercake'

const { xRange, yScale, percentRange } = getContext<LayerCake>('LayerCake')

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

  // Whether this component should use percentage or pixel values. If
  // `percentRange={true}` it defaults to `'%'`. Options: `'%'` or `'px'`.
  units?: string
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
  units = $percentRange === true ? '%' : 'px',
}: Props = $props()

const isBandwidth = typeof $yScale.bandwidth === 'function'

const tickVals: number[] = Array.isArray(ticks)
  ? ticks
  : isBandwidth
    ? $yScale.domain()
    : typeof ticks === 'function'
      ? ticks($yScale.ticks())
      : $yScale.ticks(ticks)

function calcStringLength(sum: number, val: string) {
  if (val === ',' || val === '.') return sum + charPixelWidth * 0.5
  return sum + charPixelWidth
}

const widestTickLen = Math.max(
  10,
  Math.max(
    ...tickVals.map((d) =>
      format(d).toString().split('').reduce(calcStringLength, 0),
    ),
  ),
)

const tickLen =
  tickMarks === true
    ? labelPosition === 'above'
      ? (tickMarkLength ?? widestTickLen)
      : (tickMarkLength ?? 6)
    : 0

const x1 = -tickGutter - (labelPosition === 'above' ? widestTickLen : tickLen)
const halfBand = isBandwidth ? $yScale.bandwidth() / 2 : 0

const maxTickValUnits = Math.max(...(tickVals.map($yScale) as number[]))
</script>

<div class="axis y-axis">
  {#each tickVals as tick, i (tick)}
    {@const tickValUnits = $yScale(tick)}

    <div
      class="tick tick-{i}"
      style="left:{$xRange[0]}{units};top:{tickValUnits + halfBand}{units};"
    >
      {#if gridlines === true}
        <div class="gridline" style="top:0;" style:left="{x1}px" style:right="0px"></div>
      {/if}
      {#if tickMarks === true}
        <div class="tick-mark" style:top="0" style:left="{x1}px" style:width="{tickLen}px"></div>
      {/if}
      <div
        class="text"
        style:top="0"
        style:text-align={labelPosition === 'even' ? 'right' : 'left'}
        style:width="{widestTickLen}px"
        style:left="{-widestTickLen - tickGutter - (labelPosition === 'even' ? tickLen : 0)}px"
        style:transform="translate({dx + (labelPosition === 'even' ? -3 : 0)}px, calc(-50% + {dy +
          (labelPosition === 'above' ||
          (snapBaselineLabel === true && tickValUnits === maxTickValUnits)
            ? -3
            : 4)}px))"
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
  .baseline,
  .text {
    position: absolute;
  }
  .axis {
    width: 100%;
    height: 100%;
  }
  .tick {
    font-size: 11px;
    width: 100%;
  }

  .gridline {
    border-top: 1px dashed #aaa;
  }
  .tick-mark {
    border-top: 1px solid #aaa;
  }

  .baseline.gridline {
    border-top-style: solid;
  }

  .tick .text {
    color: #666;
  }
</style>
