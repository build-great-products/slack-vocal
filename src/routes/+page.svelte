<script lang="ts">
import TimeSelector from "$lib/components/TimeSelector.svelte";
import Chart from "$lib/components/Chart.svelte";
import type { TimeUnit } from "$lib/server/types";

export let data;

let activeTimeUnit: TimeUnit = "day";
$: chartData = data.chartData[activeTimeUnit];
</script>

<svelte:head>
  <title>Slack Vocal - Message Activity</title>
</svelte:head>

<div class="container">
  <h1>Slack Message Activity (Last 90 Days)</h1>

  <TimeSelector bind:activeTimeUnit />

  <Chart data={chartData} />
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    text-align: center;
    color: #1a1a1a;
    margin-bottom: 20px;
  }
</style>
