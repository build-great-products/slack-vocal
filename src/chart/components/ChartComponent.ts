import { html } from "htm/preact";

export function ChartComponent() {
	// Chart render placeholder (this doesn't actually render a chart)
	// Chart.js is client-side only and will be initialized via the script tag
	return html`
		<div className="chart-container">
			<canvas id="messageChart" />
		</div>
	`;
}
