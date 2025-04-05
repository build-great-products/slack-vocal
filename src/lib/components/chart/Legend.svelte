<script lang="ts">
type Props = {
	// The names of the series
	seriesNames?: string[];

	// The colors corresponding to each series
	colors?: string[];
};

const { seriesNames = [], colors = [] }: Props = $props();
</script>

<div class="legend">
  {#each seriesNames as name, index (index)}
    <div class="legend-item">
      <div class="color-box" style="background-color: {colors[index]};"></div>
      <div class="series-name">{name}</div>
    </div>
  {/each}
</div>

<style>
  .legend {
    font-size: 14px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .color-box {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    margin-right: 8px;
  }

  .series-name {
    color: #333;
  }
</style>
