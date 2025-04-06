<script lang="ts">
import { LayerCake, Svg, Html, groupLonger, flatten } from 'layercake'
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

const { data: rawData }: Props = $props()

const xKey = 'date'
const yKey = 'value'
const zKey = 'userId'

const xKeyCast = timeParse('%Y-%m-%d')

type CastData = Array<{
  date: Date
  [key: string]: number | Date
}>

const data: CastData = $derived(
  rawData.map((d) => {
    return {
      ...d,
      [xKey]: xKeyCast(d[xKey]) as Date,
    }
  }),
)

const seriesNames = $derived(Object.keys(data[0]).filter((d) => d !== xKey))
const seriesColors = ['#ffe4b8', '#ffb3c0', '#ff7ac7', '#ff00cc']

const formatLabelX = timeFormat('%b. %e')
const formatLabelY = (d: number) => format(`~s`)(d)

const groupedData = $derived(
  groupLonger(data, seriesNames, {
    groupTo: zKey,
    valueTo: yKey,
  }),
)
</script>

<div class="chart-wrapper">
  <LayerCake
    padding={{ top: 20, right: 100, bottom: 40, left: 60 }}
    x={xKey}
    y={yKey}
    z={zKey}
    yDomain={[0, null]}
    zScale={scaleOrdinal()}
    zRange={seriesColors}
    flatData={flatten(groupedData, 'values')}
    data={groupedData}
  >
    <Svg>
      <AxisX
        gridlines={false}
        ticks={data.map(d => d[xKey]).sort((a, b) => a.getTime() - b.getTime())}
        format={formatLabelX}
        snapLabels
        tickMarks
      />
      <AxisY ticks={4} format={formatLabelY} />
      <MultiLine />
    </Svg>

    <Html>
      <Labels />
      <SharedTooltip formatTitle={formatLabelX} dataset={data} />
    </Html>
  </LayerCake>
</div>

<style>
  .chart-wrapper {
    height: 500px;
    width: 100%;
    position: relative;
  }
</style>
