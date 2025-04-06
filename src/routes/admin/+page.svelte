<script lang="ts">
import { format } from 'date-fns'

export let data
export let form

let syncing = false

function handleSyncClick() {
  syncing = true
}

$: lastSyncDate = data.lastSyncDate
$: lastSyncText = data.lastSyncText
$: syncSuccess = form?.success
</script>

<svelte:head>
  <title>Slack Vocal - Admin</title>
</svelte:head>

<div class="container">
  <h1>Slack Vocal Admin</h1>
  
  <div class="card">
    <h2>Data Synchronization</h2>
    
    <div class="info-row">
      <strong>Last Synchronized:</strong> 
      <span>{format(lastSyncDate, 'PPpp')} ({lastSyncText})</span>
    </div>
    
    <form method="POST" action="?/triggerSync" on:submit={handleSyncClick}>
      <button type="submit" disabled={syncing}>
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </form>
    
    {#if syncSuccess}
      <div class="success-message">
        Sync completed successfully.
      </div>
    {/if}
  </div>
  
  <div class="card">
    <h2>Data Management</h2>
    
    <p>
      The database contains message data going back 90 days from when you first started using the application.
      Each sync only fetches new data since the last sync.
    </p>
    
    <a href="/" class="button">Back to Dashboard</a>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    color: #1a1a1a;
    margin-bottom: 20px;
  }
  
  .card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .info-row {
    margin-bottom: 15px;
  }
  
  button, .button {
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: bold;
    display: inline-block;
    text-decoration: none;
  }
  
  button:hover, .button:hover {
    background-color: #3a80d2;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .success-message {
    margin-top: 15px;
    padding: 10px;
    background-color: #e6f7e6;
    color: #2e7d32;
    border-radius: 4px;
  }
</style>
