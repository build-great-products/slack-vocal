<script lang="ts">
import TimeSelector from "$lib/components/TimeSelector.svelte";
import Chart from "$lib/components/Chart.svelte";

import type { TimeUnit } from "$lib/server/types.js";
import type { PageData } from "./$types.js";

type Props = {
	data: PageData;
};

const { data }: Props = $props();

let activeTimeUnit = $state<TimeUnit>("day");
const chartData = $derived(data.chartData[activeTimeUnit]);
</script>

<svelte:head>
  <title>Slack Vocal - Message Activity</title>
</svelte:head>

<div class="container">
  <div class="header">
    <h1>Slack Message Activity</h1>
    <a href="/admin" class="admin-link">Admin</a>
  </div>

  <TimeSelector bind:activeTimeUnit />

  <Chart data={chartData} />

  <div class="info-footer">
    <p>Displaying data for the last 90 days. Historical data is preserved in the database.</p>
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h1 {
    color: #1a1a1a;
    margin: 0;
  }

  .admin-link {
    background-color: #f0f0f0;
    color: #333;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
  }

  .admin-link:hover {
    background-color: #e0e0e0;
  }

  .info-footer {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;
  }
</style>
