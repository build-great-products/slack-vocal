import { h, hydrate } from "preact";

import { App } from "./components/App.ts";

export function generateClientScript(chartData: Record<string, unknown>) {
	// Hydrate the server-rendered app
	document.addEventListener("DOMContentLoaded", () => {
		const container = document.querySelector(".container");

		// Pass the chartData so the client has access to it
		hydrate(h(App, { chartData }), container.parentNode, container);
	});
}
