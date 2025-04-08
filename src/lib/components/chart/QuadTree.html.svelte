<script lang="ts">
import { getContext } from 'svelte'
import { quadtree } from 'd3-quadtree'
import type { LayerCake } from 'layercake'
import type { Snippet } from 'svelte'

const { data, xGet, yGet, width, height } = getContext<LayerCake>('LayerCake')

type Props = {
  // The dimension to search across when moving the mouse left and right
  x?: string

  // The dimension to search across when moving the mouse up and down
  y?: string

  // The number of pixels to search around the mouse's location
  searchRadius?: number

  // The dataset to work off of—defaults to $data if left unset
  dataset?: unknown[]

  children: Snippet<
    [
      {
        x: number
        y: number
        found: Record<string, number | Date> | undefined
      },
    ]
  >
}

const {
  x = 'x',
  y = 'y',
  searchRadius = undefined,
  dataset = undefined,
  children,
}: Props = $props()

let found = $state<Record<string, number | Date>>()

const xGetter = $derived(x === 'x' ? $xGet : $yGet)
const yGetter = $derived(y === 'y' ? $yGet : $xGet)

const finder = $derived(
  quadtree<Record<string, number | Date>>()
    .extent([
      [-1, -1],
      [$width + 1, $height + 1],
    ])
    .x(xGetter)
    .y(yGetter)
    .addAll(dataset || $data),
)

function findItem(event: MouseEvent) {
  const evt = event as unknown as Record<string, number>

  const xLayerKey = `layer${x.toUpperCase()}`
  const yLayerKey = `layer${y.toUpperCase()}`

  const xLayerVal = (evt[xLayerKey] / (x === 'x' ? $width : $height)) * 100
  const yLayerVal = (evt[yLayerKey] / (y === 'y' ? $height : $width)) * 100
  found = finder.find(xLayerVal, yLayerVal, searchRadius) || undefined
}
</script>

<div
  class="bg"
  onmousemove={findItem}
  onmouseout={() => (found = undefined)}
  onblur={() => (found = undefined)}
  role="tooltip"
></div>

{#if found}
  {@render children({
    x: xGetter(found) ?? 0,
    y: yGetter(found) ?? 0,
    found,
  })}
{/if}

<style>
  .bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>
