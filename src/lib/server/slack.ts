import { WebClient } from "@slack/web-api";
import { format, fromUnixTime, getUnixTime, subDays } from "date-fns";
import type {
	MessageCounts,
	SlackConfig,
	UserInfo,
	UserMessageCounts,
} from "./types";

export async function fetchUserDetails(
	token: string,
	userId: string,
): Promise<UserInfo> {
	const client = new WebClient(token);

	try {
		const response = await client.users.info({ user: userId });

		if (!response.user) {
			throw new Error(`User not found: ${userId}`);
		}

		// Prefer display name, fallback to real name, then user ID
		const name =
			response.user.profile?.display_name &&
			response.user.profile.display_name.trim() !== ""
				? response.user.profile.display_name
				: response.user.real_name || userId;

		return {
			id: userId,
			name,
		};
	} catch (error) {
		console.error(`Error fetching user details for ${userId}:`, error);
		// Fallback to just using the ID as name
		return {
			id: userId,
			name: userId,
		};
	}
}

async function fetchSingleUserMessages(
	client: WebClient,
	userId: string,
	oldest: number,
): Promise<MessageCounts> {
	const messageCounts: MessageCounts = {};

	try {
		// Get list of all conversations the user is in
		const conversationsResponse = await client.users.conversations({
			user: userId,
			limit: 100,
			types: "public_channel,private_channel",
		});

		const channels = conversationsResponse.channels || [];

		// For each channel, get messages from this user
		for (const channel of channels) {
			if (!channel.id) continue;

			let cursor: string | undefined;

			do {
				const historyResponse = await client.conversations.history({
					channel: channel.id,
					oldest: String(oldest),
					limit: 100,
					cursor,
				});

				const messages = historyResponse.messages || [];

				// Filter messages by the specified user and count by day
				for (const message of messages) {
					if (message.user === userId && message.ts) {
						const date = format(
							fromUnixTime(Number.parseInt(message.ts, 10)),
							"yyyy-MM-dd",
						);
						messageCounts[date] = (messageCounts[date] || 0) + 1;
					}
				}

				cursor = historyResponse.response_metadata?.next_cursor;
			} while (cursor);
		}

		return messageCounts;
	} catch (error) {
		console.error(`Error fetching messages for user ${userId}:`, error);
		throw error;
	}
}

export async function fetchUserMessages(
	config: SlackConfig,
): Promise<UserMessageCounts> {
	const { token, users } = config;
	const client = new WebClient(token);
	const userMessageCounts: UserMessageCounts = {};

	// Calculate timestamp for 90 days ago
	const ninetyDaysAgo = subDays(new Date(), 90);
	const oldest = getUnixTime(ninetyDaysAgo);

	// Fetch messages for each user in parallel
	const fetchPromises = users.map(async (user) => {
		try {
			const messageCounts = await fetchSingleUserMessages(
				client,
				user.id,
				oldest,
			);
			userMessageCounts[user.id] = messageCounts;
		} catch (error) {
			console.error(`Failed to fetch messages for user ${user.name}:`, error);
			// Initialize with empty data if fetch fails
			userMessageCounts[user.id] = {};
		}
	});

	await Promise.all(fetchPromises);
	return userMessageCounts;
}
