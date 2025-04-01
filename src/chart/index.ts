import { html } from "htm/preact";
import { h } from "preact";
import { render } from "preact-render-to-string";

import { generateClientScript } from "./client-script.ts";
import { ChartComponent } from "./components/ChartComponent.ts";
import { TimeSelector } from "./components/TimeSelector.ts";
import { generateDateRange, prepareAllChartData } from "./data-aggregator.ts";
import { styles } from "./styles.ts";
import type { ChartProps, UserInfo, UserMessageCounts } from "./types.d.ts";

// App component that matches the client-side App for hydration
function App({ chartData }: { chartData: Record<string, unknown> }) {
	return html`
    <div className="container">
      <h1>Slack Message Activity (Last 90 Days)</h1>
      <${TimeSelector} activeTimeUnit="day" />
      <${ChartComponent} />
    </div>
  `;
}

export function generateHtmlChart(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
): string {
	// Prepare all chart data
	const dateRange = generateDateRange(90);
	const chartData = prepareAllChartData(userMessageCounts, users, dateRange);

	// Generate client-side script with prepared data
	const clientScript = generateClientScript(chartData);

	// Render the Preact app to string using html
	const appHtml = render(html`<${App} chartData=${chartData} />`);

	// Create HTML content with Chart.js and module script type
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slack Message Activity</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    ${styles}
  </style>
</head>
<body>
  ${appHtml}
  <script type="module">
    ${clientScript}
  </script>
</body>
</html>
  `;
}
