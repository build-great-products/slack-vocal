import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { format } from 'date-fns'

import type { UserInfo } from './types'

const DATE_FORMAT = 'yyyy-MM-dd'

// Ensure data directory exists
const DB_DIR = path.join(process.cwd(), '.data')
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

const DB_PATH = path.join(DB_DIR, 'slack-vocal.sqlite')
const db = new Database(DB_PATH)

// Enable foreign keys support
db.pragma('foreign_keys = ON')

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
  `)

  // Initialize sync_info if it doesn't exist
  const syncInfo = db.prepare('SELECT * FROM sync_info WHERE id = 1').get()
  if (!syncInfo) {
    // Default to 90 days ago as starting point
    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60
    db.prepare('INSERT INTO sync_info (id, last_sync_time) VALUES (1, ?)').run(
      ninetyDaysAgo,
    )
  }
}

// User functions
function upsertUser(user: UserInfo): void {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO users (id, name) VALUES (?, ?)',
  )
  stmt.run(user.id, user.name)
}

function getUsers(): UserInfo[] {
  return db.prepare('SELECT id, name FROM users').all() as UserInfo[]
}

// Message functions
function saveMessageCounts(
  userId: string,
  messageCounts: Record<string, number>,
): void {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO messages (user_id, date, count) VALUES (?, ?, ?)',
  )

  // Use a transaction for better performance with multiple inserts
  const transaction = db.transaction(
    (data: { userId: string; entries: [string, number][] }) => {
      for (const [date, count] of data.entries) {
        stmt.run(data.userId, date, count)
      }
    },
  )

  transaction({
    userId,
    entries: Object.entries(messageCounts),
  })
}

type GetMessageCountsForTimeRangeOptions = {
  startDate: Date
  endDate: Date
}

function getMessageCountsForTimeRange(
  options: GetMessageCountsForTimeRangeOptions,
): Record<string, Record<string, number>> {
  const { startDate, endDate } = options

  const rows = db
    .prepare<
      {
        startDate: string
        endDate: string
      },
      {
        user_id: string
        name: string
        date: string
        count: number
      }
    >(`
    SELECT u.id as user_id, u.name, m.date, m.count
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.date BETWEEN $startDate AND $endDate
    ORDER BY m.date
  `)
    .all({
      startDate: format(startDate, DATE_FORMAT),
      endDate: format(endDate, DATE_FORMAT),
    })

  // Transform into the expected format
  const result: Record<string, Record<string, number>> = {}

  for (const row of rows) {
    if (!result[row.user_id]) {
      result[row.user_id] = {}
    }
    result[row.user_id][row.date] = row.count
  }

  return result
}

// Sync info functions
function getLastSyncTime(): number {
  const result = db
    .prepare('SELECT last_sync_time FROM sync_info WHERE id = 1')
    .get() as { last_sync_time: number }
  return result?.last_sync_time || 0
}

function updateLastSyncTime(timestamp: number): void {
  db.prepare('UPDATE sync_info SET last_sync_time = ? WHERE id = 1').run(
    timestamp,
  )
}

// Initialize the database on module import
initializeDatabase()

export {
  db,
  upsertUser,
  getUsers,
  saveMessageCounts,
  getMessageCountsForTimeRange,
  getLastSyncTime,
  updateLastSyncTime,
}
