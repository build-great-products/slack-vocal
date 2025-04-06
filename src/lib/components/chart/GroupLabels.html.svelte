<script lang="ts">
import { getContext } from 'svelte'
import { max } from 'd3-array'
import type { LayerCake } from 'layercake'

const { data, x, y, xScale, yScale, xRange, yRange, z } =
  getContext<LayerCake>('LayerCake')

/**
 * Title case the first letter
 */
const cap = (val: string): string => val.replace(/^\w/, (d) => d.toUpperCase())

/**
 * Put the label on the highest value
 */
const left = $derived(
  (values: unknown[]) => $xScale(max(values, $x)) / Math.max(...$xRange),
)
const top = $derived(
  (values: unknown[]) => $yScale(max(values, $y)) / Math.max(...$yRange),
)
</script>

{#each $data as group, index (index)}
  <div
    class="label"
    style="
      top:{top(group.values) * 100}%;
      left:{left(group.values) * 100}%;
    "
  >
    {cap($z(group))}
  </div>
{/each}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%) translateY(1px);
    font-size: 13px;
  }
</style>
