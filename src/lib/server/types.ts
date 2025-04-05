export type UserInfo = {
	id: string;
	name: string;
};

export type MessageCounts = {
	[date: string]: number;
};

export type UserMessageCounts = {
	[userId: string]: MessageCounts;
};

export type SlackConfig = {
	token: string;
	users: UserInfo[];
};

export type TimeUnit = "day" | "week" | "month";

export type ChartDataset = {
	name: string;
	data: (number | null)[];
	color: string;
};

export type ChartData = {
	labels: string[];
	datasets: ChartDataset[];
};

export type FormattedChartData = {
	day: ChartData;
	week: ChartData;
	month: ChartData;
};
