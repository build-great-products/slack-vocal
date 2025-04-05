import { error } from "@sveltejs/kit";

import { SLACK_TOKEN, SLACK_USER_IDS } from "$env/static/private";

import { fetchUserDetails, fetchUserMessages } from "$lib/server/slack";
import { generateDateRange, prepareAllChartData } from "$lib/utils/data";

export async function load() {
	try {
		// Parse the user IDs from the environment variable
		const userIds = SLACK_USER_IDS.split(",").map((id) => id.trim());

		if (!SLACK_TOKEN || userIds.length === 0) {
			throw new Error(
				"Missing required environment variables: SLACK_TOKEN and/or SLACK_USER_IDS",
			);
		}

		// Fetch user details from Slack
		const userPromises = userIds.map((id) => fetchUserDetails(SLACK_TOKEN, id));
		const users = await Promise.all(userPromises);

		// Fetch message data for all users
		const config = {
			token: SLACK_TOKEN,
			users,
		};

		const userMessageCounts = await fetchUserMessages(config);

		// Prepare chart data
		const dateRange = generateDateRange(90);
		const chartData = prepareAllChartData(userMessageCounts, users, dateRange);

		return {
			chartData,
			users,
		};
	} catch (e) {
		console.error("Error loading Slack data:", e);
		throw error(500, "Failed to load Slack data");
	}
}
