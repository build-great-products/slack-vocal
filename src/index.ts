import fs from "node:fs/promises";

import { generateHtmlChart } from "./chart-generator.ts";
import { fetchUserDetails, fetchUserMessages } from "./slack-service.ts";
import type { SlackConfig, UserInfo } from "./types.ts";

async function main() {
	// Check for environment variables
	const token = process.env.SLACK_TOKEN;
	const userIds =
		process.env.SLACK_USER_IDS?.split(",").map((id) => id.trim()) || [];

	// Validate configuration
	if (!token || userIds.length === 0) {
		console.error(
			"Error: SLACK_TOKEN and SLACK_USER_IDS environment variables are required.",
			"SLACK_USER_IDS should be a comma-separated list of user IDs.",
		);
		process.exit(1);
	}

	// Fetch user details from Slack
	console.log("Fetching user details from Slack...");
	const userPromises = userIds.map((id) => fetchUserDetails(token, id));
	const users = await Promise.all(userPromises);

	// Log the configured users
	console.log("Users:", users.map((u) => `${u.name} (${u.id})`).join(", "));

	const config: SlackConfig = {
		token,
		users,
	};

	try {
		console.log("Fetching messages from Slack...");
		const userMessageCounts = await fetchUserMessages(config);

		console.log("Generating HTML chart...");
		const htmlContent = generateHtmlChart(userMessageCounts, users);

		// Write the HTML file
		const outputPath = "slack-activity.html";
		await fs.writeFile(outputPath, htmlContent);

		console.log(`Chart generated successfully! View it at: ${outputPath}`);
	} catch (error) {
		console.error("An error occurred:", error);
		process.exit(1);
	}
}

main().catch(console.error);
