export type TimeUnit = "day" | "week" | "month";

export type ChartDataset = {
	name: string;
	data: (number | null)[];
	fill: string;
	stroke: string;
	type: string;
	dataKey: string;
	fillOpacity: number;
	activeDot: { r: number };
};

export type AggregatedData = {
	dates: string[];
	datasets: ChartDataset[];
};
