import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import type { UserInfo } from "./types";

// Ensure data directory exists
const DB_DIR = path.join(process.cwd(), ".data");
if (!existsSync(DB_DIR)) {
	mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "slack-vocal.sqlite");
const db = new Database(DB_PATH);

// Enable foreign keys support
db.pragma("foreign_keys = ON");

// Initialize database schema
function initializeDatabase() {
	db.exec(`
    -- Users table to store user information
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    -- Messages table to store daily message counts
    CREATE TABLE IF NOT EXISTS messages (
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Sync info table to track last sync time
    CREATE TABLE IF NOT EXISTS sync_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_sync_time INTEGER NOT NULL
    );
  `);

	// Initialize sync_info if it doesn't exist
	const syncInfo = db.prepare("SELECT * FROM sync_info WHERE id = 1").get();
	if (!syncInfo) {
		// Default to 90 days ago as starting point
		const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
		db.prepare("INSERT INTO sync_info (id, last_sync_time) VALUES (1, ?)").run(
			ninetyDaysAgo,
		);
	}
}

// User functions
export function upsertUser(user: UserInfo): void {
	const stmt = db.prepare(
		"INSERT OR REPLACE INTO users (id, name) VALUES (?, ?)",
	);
	stmt.run(user.id, user.name);
}

export function getUsers(): UserInfo[] {
	return db.prepare("SELECT id, name FROM users").all() as UserInfo[];
}

// Message functions
export function saveMessageCounts(
	userId: string,
	messageCounts: Record<string, number>,
): void {
	const stmt = db.prepare(
		"INSERT OR REPLACE INTO messages (user_id, date, count) VALUES (?, ?, ?)",
	);

	// Use a transaction for better performance with multiple inserts
	const transaction = db.transaction(
		(data: { userId: string; entries: [string, number][] }) => {
			for (const [date, count] of data.entries) {
				stmt.run(data.userId, date, count);
			}
		},
	);

	transaction({
		userId,
		entries: Object.entries(messageCounts),
	});
}

export function getMessageCountsForTimeRange(
	startDate: string,
	endDate: string,
): Record<string, Record<string, number>> {
	const rows = db
		.prepare(`
    SELECT u.id as user_id, u.name, m.date, m.count
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.date BETWEEN ? AND ?
    ORDER BY m.date
  `)
		.all(startDate, endDate) as {
		user_id: string;
		name: string;
		date: string;
		count: number;
	}[];

	// Transform into the expected format
	const result: Record<string, Record<string, number>> = {};

	for (const row of rows) {
		if (!result[row.user_id]) {
			result[row.user_id] = {};
		}
		result[row.user_id][row.date] = row.count;
	}

	return result;
}

// Sync info functions
export function getLastSyncTime(): number {
	const result = db
		.prepare("SELECT last_sync_time FROM sync_info WHERE id = 1")
		.get() as { last_sync_time: number };
	return result?.last_sync_time || 0;
}

export function updateLastSyncTime(timestamp: number): void {
	db.prepare("UPDATE sync_info SET last_sync_time = ? WHERE id = 1").run(
		timestamp,
	);
}

// Initialize the database on module import
initializeDatabase();

export default db;
