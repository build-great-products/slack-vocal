import type * as Preact from "preact";
import type { UserInfo, UserMessageCounts } from "../types.ts";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[elemName: string]: Record<string, unknown>;
		}
	}
}

export type { UserInfo, UserMessageCounts };

export type TimeUnit = "day" | "week" | "month";

export interface ChartDataset {
	label: string;
	data: number[];
	backgroundColor: string;
	borderColor: string;
	borderWidth: number;
	tension: number;
	pointRadius: number;
	pointHoverRadius: number;
	pointBackgroundColor: string;
	fill: boolean;
}

export interface AggregatedData {
	labels: string[];
	datasets: ChartDataset[];
}

export interface ChartProps {
	userMessageCounts: UserMessageCounts;
	users: UserInfo[];
}
