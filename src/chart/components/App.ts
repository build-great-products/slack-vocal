import { html } from "htm/preact";
import { useState } from "preact/hooks";

import { Chart } from "./Chart.ts";
import { TimeSelector } from "./TimeSelector.ts";

interface AppProps {
	chartData: Record<string, unknown>;
}

// Main app component
function App(props: AppProps) {
	const { chartData } = props;

	const [activeTimeUnit, setActiveTimeUnit] = useState("day");

	const handleTimeUnitChange = (period: string) => {
		if (activeTimeUnit !== period) {
			setActiveTimeUnit(period);
		}
	};

	return html`
    <div className="container">
      <h1>Slack Message Activity (Last 90 Days)</h1>
      <${TimeSelector} activeTimeUnit=${activeTimeUnit} onTimeUnitChange=${handleTimeUnitChange} />
      <div className="chart-container">
        <${Chart} data=${chartData[activeTimeUnit]} />
      </div>
    </div>
  `;
}

export { App };
