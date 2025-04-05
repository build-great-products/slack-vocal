<script lang="ts">
import type { TimeUnit } from "$lib/server/types";

export let activeTimeUnit: TimeUnit = "day";

function handleTimeUnitChange(newUnit: TimeUnit) {
	activeTimeUnit = newUnit;
}
</script>

<div class="time-selector">
  <button 
    type="button" 
    class="time-button {activeTimeUnit === 'day' ? 'active' : ''}" 
    on:click={() => handleTimeUnitChange('day')}
  >
    Daily
  </button>
  <button 
    type="button" 
    class="time-button {activeTimeUnit === 'week' ? 'active' : ''}" 
    on:click={() => handleTimeUnitChange('week')}
  >
    Weekly
  </button>
  <button 
    type="button" 
    class="time-button {activeTimeUnit === 'month' ? 'active' : ''}" 
    on:click={() => handleTimeUnitChange('month')}
  >
    Monthly
  </button>
</div>

<style>
  .time-selector {
    display: flex;
    justify-content: center;
    margin: 20px 0;
    gap: 10px;
  }
  
  .time-button {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
  }
  
  .time-button:hover {
    background-color: #e0e0e0;
  }
  
  .time-button.active {
    background-color: #4a90e2;
    color: white;
    border-color: #3a80d2;
  }
</style>
