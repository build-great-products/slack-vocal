<script lang="ts">
import { LayerCake, ScaledSvg, Html, flatten } from 'layercake'
import { timeParse, timeFormat } from 'd3-time-format'
import { scaleOrdinal } from 'd3-scale'
import { format } from 'd3-format'

import type { ChartData } from '$lib/server/types.js'

import MultiLine from './chart/MultiLine.svelte'
import AxisX from './chart/AxisX.svelte'
import AxisY from './chart/AxisY.svelte'
import Labels from './chart/GroupLabels.html.svelte'
import SharedTooltip from './chart/SharedTooltip.html.svelte'

type Props = {
  data: ChartData
}

const { data }: Props = $props()

const xKey = 'date'
const yKey = 'value'
const zKey = 'userId'

const xKeyCast = timeParse('%Y-%m-%d')

const seriesNames = $derived(Object.keys(data[0]).filter((d) => d !== xKey))
const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc']

const formatLabelX = (date: unknown) => timeFormat('%b. %e')(date as Date)
const formatLabelY = (value: unknown) => format(`~s`)(value as number)

const dataLong = $derived(
  seriesNames.map((key) => {
    return {
      [zKey]: key,
      values: data.map((d) => {
        const xKeyValue =
          typeof d[xKey] === 'string' ? xKeyCast(d[xKey]) : d[xKey]
        return {
          [yKey]: +d[key],
          [xKey]: xKeyValue,
          [zKey]: key,
        }
      }),
    }
  }),
)
</script>

<div class="chart-container">
  <LayerCake
    ssr
    percentRange
    padding={{ top: 7, right: 10, bottom: 20, left: 25 }}
    x={xKey}
    y={yKey}
    z={zKey}
    yDomain={[0, null]}
    zScale={scaleOrdinal()}
    zRange={seriesColors}
    flatData={flatten(dataLong, 'values')}
    data={dataLong}
  >
    <Html>
      <AxisX
        gridlines={false}
        format={formatLabelX}
        snapLabels
        tickMarks
      />
      <AxisY ticks={4} format={formatLabelY} />
    </Html>

    <ScaledSvg>
      <MultiLine />
    </ScaledSvg>

    <Html>
      <Labels />
      <SharedTooltip formatTitle={formatLabelX} dataset={data} />
    </Html>
  </LayerCake>
</div>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    width: 100%;
    height: 250px;
  }
</style>
