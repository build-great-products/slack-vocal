import { error } from "@sveltejs/kit";
import { format, subDays } from "date-fns";

import { SLACK_TOKEN, SLACK_USER_IDS } from "$env/static/private";

import {
	fetchUserDetails,
	fetchUserMessages,
	getStoredUserMessages,
} from "$lib/server/slack";
import { generateDateRange, prepareAllChartData } from "$lib/utils/data";
import { getUsers } from "$lib/server/db";

export async function load() {
	try {
		// Parse the user IDs from the environment variable
		const userIds = SLACK_USER_IDS.split(",").map((id) => id.trim());

		if (!SLACK_TOKEN || userIds.length === 0) {
			throw new Error(
				"Missing required environment variables: SLACK_TOKEN and/or SLACK_USER_IDS",
			);
		}

		// Get the time window for data
		const today = new Date();
		const startDate = format(subDays(today, 90), "yyyy-MM-dd");
		const endDate = format(today, "yyyy-MM-dd");

		// First check if we have users in the database
		let users = getUsers();

		// If no users in DB, fetch them from Slack
		if (users.length === 0) {
			// Fetch user details from Slack
			const userPromises = userIds.map((id) =>
				fetchUserDetails(SLACK_TOKEN, id),
			);
			users = await Promise.all(userPromises);
		} else {
			// Make sure all configured users are in the database
			// This handles cases where new users were added to the config
			const existingUserIds = users.map((u) => u.id);
			const missingUserIds = userIds.filter(
				(id) => !existingUserIds.includes(id),
			);

			if (missingUserIds.length > 0) {
				const newUserPromises = missingUserIds.map((id) =>
					fetchUserDetails(SLACK_TOKEN, id),
				);
				const newUsers = await Promise.all(newUserPromises);
				users = [...users, ...newUsers];
			}
		}

		// Configure the Slack client
		const config = {
			token: SLACK_TOKEN,
			users,
		};

		// Fetch new message data from Slack (incremental update)
		await fetchUserMessages(config);

		// Now get the complete dataset from the database
		const userMessageCounts = getStoredUserMessages(startDate, endDate);

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
