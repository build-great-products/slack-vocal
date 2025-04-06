<script lang="ts">
import type { LayerCake } from 'layercake'
import { getContext } from 'svelte'
import { line, curveLinear } from 'd3-shape'

const { data, xGet, yGet, zGet } = getContext<LayerCake>('LayerCake')

const path = line().x($xGet).y($yGet).curve(curveLinear)
</script>

<g class="line-group">
  {#each $data as group, index (index)}
    <path class="path-line" d={path(group.values)} stroke={$zGet(group)}></path>
  {/each}
</g>

<style>
  .path-line {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 3px;
  }
</style>
