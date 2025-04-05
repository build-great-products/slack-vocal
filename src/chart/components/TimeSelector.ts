import { html } from "htm/preact";
import type { TimeUnit } from "../types.ts";

interface TimeSelectorProps {
	activeTimeUnit: TimeUnit;
	onTimeUnitChange?: (period: TimeUnit) => void;
}

function TimeSelector(props: TimeSelectorProps) {
	const { activeTimeUnit, onTimeUnitChange } = props;

	return html`
    <div className="time-selector">
      <button
        type="button"
        className=${`time-button ${activeTimeUnit === "day" ? "active" : ""}`}
        data-period="day"
        onClick=${() => onTimeUnitChange?.("day")}
      >
        Daily
      </button>
      <button
        type="button"
        className=${`time-button ${activeTimeUnit === "week" ? "active" : ""}`}
        data-period="week"
        onClick=${() => onTimeUnitChange?.("week")}
      >
        Weekly
      </button>
      <button
        type="button"
        className=${`time-button ${activeTimeUnit === "month" ? "active" : ""}`}
        data-period="month"
        onClick=${() => onTimeUnitChange?.("month")}
      >
        Monthly
      </button>
    </div>
	`;
}

export { TimeSelector };
