import {
	eachDayOfInterval,
	format,
	getMonth,
	getWeek,
	getYear,
	parseISO,
	subDays,
} from "date-fns";
import type {
	UserInfo,
	UserMessageCounts,
	ChartData,
	FormattedChartData,
} from "$lib/server/types";

// Colorblind-friendly palette
const COLORBLIND_FRIENDLY_COLORS = [
	"rgba(0, 114, 178, 1)", // blue
	"rgba(230, 159, 0, 1)", // orange
	"rgba(0, 158, 115, 1)", // green
	"rgba(204, 121, 167, 1)", // purple
	"rgba(213, 94, 0, 1)", // vermillion/red
];

// Generate an array of days for a time period
export function generateDateRange(days = 90): string[] {
	const endDate = new Date();
	const startDate = subDays(endDate, days);

	return eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
		format(date, "yyyy-MM-dd"),
	);
}

// Prepare daily chart data
function prepareDailyChartData(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dates: string[],
): ChartData {
	const datasets = users.map((user, index) => {
		const messageCounts = userMessageCounts[user.id] || {};
		const userData = dates.map((date) =>
			messageCounts[date] ? messageCounts[date] : null,
		);
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];

		return {
			name: user.name,
			data: userData,
			color,
		};
	});

	return {
		labels: dates,
		datasets,
	};
}

// Aggregate data by week or month
function aggregateByTimeUnit(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dates: string[],
	timeUnit: "week" | "month",
): ChartData {
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

	// Create datasets for chart
	const datasets = users.map((user, index) => {
		const userData = timeLabels.map((timeKey) => {
			const count = aggregatedCounts[user.id][timeKey];
			return count && count > 0 ? count : null;
		});
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];

		return {
			name: user.name,
			data: userData,
			color,
		};
	});

	return {
		labels: timeLabels.map((key) => timeMap[key]),
		datasets,
	};
}

// Prepare chart data for all time periods
export function prepareAllChartData(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
	dateRange: string[] = generateDateRange(),
): FormattedChartData {
	// Check if we have too many users for our colorblind palette
	if (users.length > COLORBLIND_FRIENDLY_COLORS.length) {
		throw new Error(
			`Too many users (${users.length}). Maximum ${COLORBLIND_FRIENDLY_COLORS.length} users supported for colorblind-friendly visualization.`,
		);
	}

	// Prepare the daily data
	const dailyData = prepareDailyChartData(userMessageCounts, users, dateRange);

	// Prepare weekly data
	const weeklyData = aggregateByTimeUnit(
		userMessageCounts,
		users,
		dateRange,
		"week",
	);

	// Prepare monthly data
	const monthlyData = aggregateByTimeUnit(
		userMessageCounts,
		users,
		dateRange,
		"month",
	);

	return {
		day: dailyData,
		week: weeklyData,
		month: monthlyData,
	};
}
