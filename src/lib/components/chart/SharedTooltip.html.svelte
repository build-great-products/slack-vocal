<script lang="ts">
import { getContext } from 'svelte'
import { format } from 'd3-format'
import QuadTree from './QuadTree.html.svelte'
import type { LayerCake } from 'layercake'

const { data, width, yScale, config } = getContext<LayerCake>('LayerCake')

const commas = format(',')
const titleCase = (d: string): string =>
  d.replace(/^\w/, (w) => w.toUpperCase())

type Props = {
  // A function to format the tooltip title, which is `$config.x`
  formatTitle?: (d: unknown) => string

  // A function to format the value
  formatValue?: (d: unknown) => string

  // A function to format the series name
  formatKey?: (d: string) => string

  // A y-offset from the hover point, in pixels
  offset?: number

  // The dataset to work off of—defaults to $data if left unset
  dataset?: unknown[]
}

const {
  formatTitle = (d) => String(d),
  formatValue = (d) => (isNaN(+String(d)) ? String(d) : commas(+String(d))),
  formatKey = (d) => titleCase(d),
  offset = -20,
  dataset = undefined,
}: Props = $props()

type ResultRow = {
  key: string
  value: unknown
}

const w = 150
const w2 = w / 2

/**
 * Sort the keys by the highest value
 */
function sortResult(result: Record<string, unknown>): ResultRow[] {
  if (Object.keys(result).length === 0) return []

  const rows = Object.keys(result)
    .filter((d) => d !== $config.x)
    .map((key) => {
      return {
        key,
        value: result[key],
      }
    })
    .sort((a, b) => b.value - a.value)

  return rows
}
</script>

<QuadTree dataset={dataset || $data} y="x">
  {#snippet children({ x, found })}
    {@const foundSorted = sortResult(found)}
    {#if found}
      <div style="left:{x}px;" class="line"></div>
      <div
        class="tooltip"
        style="
          width:{w}px;
          display: {visible ? 'block' : 'none'};
          top:{$yScale(foundSorted[0]?.value) + offset}px;
          left:{Math.min(Math.max(w2, x), $width - w2)}px;"
      >
        <div class="title">{formatTitle(found[$config.x])}</div>
        {#each foundSorted as row, index (index)}
          <div class="row">
            <span class="key">{formatKey(row.key)}:</span>
            {formatValue(row.value)}
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
</QuadTree>

<style>
  .tooltip {
    position: absolute;
    font-size: 13px;
    pointer-events: none;
    border: 1px solid #ccc;
    background: rgba(255, 255, 255, 0.85);
    transform: translate(-50%, -100%);
    padding: 5px;
    z-index: 15;
    pointer-events: none;
  }
  .line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    border-left: 1px dotted #666;
    pointer-events: none;
  }
  .tooltip,
  .line {
    transition:
      left 250ms ease-out,
      top 250ms ease-out;
  }
  .title {
    font-weight: bold;
  }
  .key {
    color: #999;
  }
</style>
