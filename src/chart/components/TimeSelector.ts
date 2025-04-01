import { html } from "htm/preact";
import type { TimeUnit } from "../types.ts";

interface TimeSelectorProps {
	activeTimeUnit: TimeUnit;
	onTimeUnitChange?: (period: TimeUnit) => void;
}

export function TimeSelector({
	activeTimeUnit,
	onTimeUnitChange,
}: TimeSelectorProps) {
	// Server-side rendering doesn't have event handlers, but we include the same structure
	// as the client-side component for hydration
	return html`
		<div className="time-selector">
			<button
				type="button"
				className=${`time-button ${activeTimeUnit === "day" ? "active" : ""}`}
				data-period="day"
				onClick=${onTimeUnitChange ? () => onTimeUnitChange("day") : undefined}
			>
				Daily
			</button>
			<button
				type="button"
				className=${`time-button ${activeTimeUnit === "week" ? "active" : ""}`}
				data-period="week"
				onClick=${onTimeUnitChange ? () => onTimeUnitChange("week") : undefined}
			>
				Weekly
			</button>
			<button
				type="button"
				className=${`time-button ${activeTimeUnit === "month" ? "active" : ""}`}
				data-period="month"
				onClick=${onTimeUnitChange ? () => onTimeUnitChange("month") : undefined}
			>
				Monthly
			</button>
		</div>
	`;
}
