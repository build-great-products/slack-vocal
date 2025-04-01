import {
	eachDayOfInterval,
	format,
	getMonth,
	getWeek,
	getYear,
	parseISO,
	subDays,
} from "date-fns";
import { COLORBLIND_FRIENDLY_COLORS } from "./colors.ts";
import type {
	AggregatedData,
	TimeUnit,
	UserInfo,
	UserMessageCounts,
} from "./types.d.ts";

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
	const datasets = users.map((user, index) => {
		const messageCounts = userMessageCounts[user.id] || {};
		const userData = dates.map((date) => messageCounts[date] || 0);
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
		const borderColor = color.replace("0.6", "1");

		return {
			label: user.name,
			data: userData,
			backgroundColor: color,
			borderColor: borderColor,
			borderWidth: 2,
			tension: 0.1,
			pointRadius: 3,
			pointHoverRadius: 5,
			pointBackgroundColor: borderColor,
			fill: false,
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
		const userData = timeLabels.map(
			(timeKey) => aggregatedCounts[user.id][timeKey] || 0,
		);
		const color =
			COLORBLIND_FRIENDLY_COLORS[index % COLORBLIND_FRIENDLY_COLORS.length];
		const borderColor = color.replace("0.6", "1");

		return {
			label: user.name,
			data: userData,
			backgroundColor: color,
			borderColor: borderColor,
			borderWidth: 2,
			tension: 0.1,
			pointRadius: 3,
			pointHoverRadius: 5,
			pointBackgroundColor: borderColor,
			fill: false,
		};
	});

	return {
		labels: displayLabels,
		datasets,
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
