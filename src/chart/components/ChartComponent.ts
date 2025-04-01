import { html } from "htm/preact";

export function ChartComponent() {
	// Just a placeholder for server-side rendering
	// The actual Recharts component will be rendered on the client
	return html`
		<div className="chart-container" id="messageChart">
			<!-- Recharts will be rendered here on the client -->
		</div>
	`;
}
