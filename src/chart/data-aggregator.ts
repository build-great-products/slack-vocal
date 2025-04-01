import {
	eachDayOfInterval,
	format,
	getMonth,
	getWeek,
	getYear,
	parseISO,
	subDays,
} from "date-fns";
import type { UserInfo, UserMessageCounts } from "../types.ts";
import { COLORBLIND_FRIENDLY_COLORS } from "./colors.ts";
import type { AggregatedData, ChartDataset } from "./types.ts";

// Generate an array of days for a time period
export function generateDateRange(days = 90): string[] {
	const endDate = new Date();
	const startDate = subDays(endDate, days);

	return eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
		format(date, "yyyy-MM-dd"),
	);
}

// Prepare daily chart data
function prepareChartData(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dates: string[],
): AggregatedData {
	const datasets: ChartDataset[] = users.map((user, index) => {
		const messageCounts = userMessageCounts[user.id] || {};
		const userData = dates.map((date) =>
			messageCounts[date] ? messageCounts[date] : null,
		);
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
		const fillColor = color;
		const strokeColor = color.replace("0.6", "1");

		return {
			name: user.name,
			data: userData,
			fill: fillColor,
			stroke: strokeColor,
			type: "monotone",
			dataKey: user.id,
			fillOpacity: 0.6,
			activeDot: { r: 5 },
		};
	});

	return {
		dates,
		datasets,
	} satisfies AggregatedData;
}

// Aggregate data by week or month
function aggregateByTimeUnit(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dates: string[],
	timeUnit: "week" | "month",
): AggregatedData {
	// Create aggregation buckets
	const aggregatedCounts: Record<string, Record<string, number>> = {};
	const timeLabels: string[] = [];
	const timeMap: Record<string, string> = {};

	// Initialize aggregation buckets for each user
	for (const user of users) {
		aggregatedCounts[user.id] = {};
	}

	// Aggregate data by the specified time unit
	for (const dateStr of dates) {
		const date = parseISO(dateStr);
		let timeKey: string;
		let displayLabel: string;

		if (timeUnit === "week") {
			const weekNum = getWeek(date);
			const year = getYear(date);
			timeKey = `${year}-W${weekNum}`;
			displayLabel = `Week ${weekNum}, ${year}`;
		} else {
			// month
			const monthNum = getMonth(date) + 1; // getMonth is 0-indexed
			const year = getYear(date);
			timeKey = `${year}-${monthNum.toString().padStart(2, "0")}`;
			displayLabel = `${format(date, "MMMM yyyy")}`;
		}

		// Add to timeLabels if not already present
		if (!timeMap[timeKey]) {
			timeMap[timeKey] = displayLabel;
			timeLabels.push(timeKey);
		}

		// Aggregate message counts for each user
		for (const user of users) {
			const messageCounts = userMessageCounts[user.id] || {};
			const count = messageCounts[dateStr] || 0;

			aggregatedCounts[user.id][timeKey] =
				(aggregatedCounts[user.id][timeKey] || 0) + count;
		}
	}

	// Sort time labels chronologically
	timeLabels.sort();

	// Convert to display labels
	const displayLabels = timeLabels.map((key) => timeMap[key]);

	// Create datasets for chart
	const datasets = users.map((user, index) => {
		const userData = timeLabels.map((timeKey) => {
			const count = aggregatedCounts[user.id][timeKey];
			return count && count > 0 ? count : null;
		});
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
		const fillColor = color;
		const strokeColor = color.replace("0.6", "1");

		return {
			name: user.name,
			data: userData,
			fill: fillColor,
			stroke: strokeColor,
			type: "monotone",
			dataKey: user.id,
			fillOpacity: 0.6,
			activeDot: { r: 5 },
		};
	});

	return {
		dates: displayLabels,
		datasets,
	};
}

// Format data for Recharts
function formatForRecharts(aggregatedData: AggregatedData, users: UserInfo[]) {
	const { dates, datasets } = aggregatedData;

	// Transform data for Recharts
	const formattedData = dates.map((date, index) => {
		const dataPoint: Record<string, number | string | null> = { date };

		// Add each user's data
		datasets.forEach((dataset, userIndex) => {
			const userId = users[userIndex].id;
			dataPoint[userId] = dataset.data[index];
			dataPoint[`${userId}_name`] = users[userIndex].name;
		});

		return dataPoint;
	});

	// Prepare the series configuration
	const series = datasets.map((dataset) => ({
		dataKey: dataset.dataKey,
		name: dataset.name,
		fill: dataset.fill,
		stroke: dataset.stroke,
		type: dataset.type,
		fillOpacity: dataset.fillOpacity,
		activeDot: dataset.activeDot,
	}));

	return {
		data: formattedData,
		series,
	};
}

// Prepare chart data for all time periods
export function prepareAllChartData(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dateRange: string[] = generateDateRange(),
) {
	// Check if we have too many users for our colorblind palette
	if (users.length > COLORBLIND_FRIENDLY_COLORS.length) {
		throw new Error(
			`Too many users (${users.length}). Maximum ${COLORBLIND_FRIENDLY_COLORS.length} users supported for colorblind-friendly visualization.`,
		);
	}

	// Prepare the daily data
	const dailyData = prepareChartData(userMessageCounts, users, dateRange);
	const dailyFormatted = formatForRecharts(dailyData, users);

	// Prepare weekly data
	const weeklyData = aggregateByTimeUnit(
		userMessageCounts,
		users,
		dateRange,
		"week",
	);
	const weeklyFormatted = formatForRecharts(weeklyData, users);

	// Prepare monthly data
	const monthlyData = aggregateByTimeUnit(
		userMessageCounts,
		users,
		dateRange,
		"month",
	);
	const monthlyFormatted = formatForRecharts(monthlyData, users);

	return {
		day: dailyFormatted,
		week: weeklyFormatted,
		month: monthlyFormatted,
	};
}
