import { WebClient } from "@slack/web-api";
import { format, fromUnixTime, getUnixTime, subDays } from "date-fns";
import type {
	MessageCounts,
	SlackConfig,
	UserInfo,
	UserMessageCounts,
} from "./types";
import {
	getLastSyncTime,
	updateLastSyncTime,
	saveMessageCounts,
	upsertUser,
	getMessageCountsForTimeRange,
} from "./db";

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

		// Save user to the database
		const userInfo = { id: userId, name };
		upsertUser(userInfo);

		return userInfo;
	} catch (error) {
		console.error(`Error fetching user details for ${userId}:`, error);
		// Fallback to just using the ID as name
		const userInfo = { id: userId, name: userId };
		upsertUser(userInfo);
		return userInfo;
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

	// Get the last sync time from the database
	let lastSyncTime = getLastSyncTime();

	// If we're syncing for the first time, get data for the last 90 days
	if (lastSyncTime === 0) {
		const ninetyDaysAgo = subDays(new Date(), 90);
		lastSyncTime = getUnixTime(ninetyDaysAgo);
	}

	// Current time for this sync
	const currentSyncTime = getUnixTime(new Date());

	// Fetch messages for each user in parallel
	const fetchPromises = users.map(async (user) => {
		try {
			const messageCounts = await fetchSingleUserMessages(
				client,
				user.id,
				lastSyncTime,
			);

			// Save the new message counts to the database
			if (Object.keys(messageCounts).length > 0) {
				saveMessageCounts(user.id, messageCounts);
			}
		} catch (error) {
			console.error(`Failed to fetch messages for user ${user.name}:`, error);
		}
	});

	await Promise.all(fetchPromises);

	// Update the last sync time
	updateLastSyncTime(currentSyncTime);

	// Return all message counts from the database
	const today = new Date();
	const ninetyDaysAgo = format(subDays(today, 90), "yyyy-MM-dd");
	const todayStr = format(today, "yyyy-MM-dd");

	return getMessageCountsForTimeRange(ninetyDaysAgo, todayStr);
}

/**
 * Fetches the complete message history from the database without making any API calls
 */
export function getStoredUserMessages(
	startDate: string,
	endDate: string,
): UserMessageCounts {
	return getMessageCountsForTimeRange(startDate, endDate);
}
