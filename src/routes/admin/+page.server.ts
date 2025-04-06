import { getLastSyncTime } from '$lib/server/db'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'

export async function load() {
  const lastSyncTime = getLastSyncTime()
  const lastSyncDate = fromUnixTime(lastSyncTime)

  return {
    lastSyncTime,
    lastSyncDate,
    lastSyncText: formatDistanceToNow(lastSyncDate, { addSuffix: true }),
  }
}

export const actions = {
  triggerSync: async () => {
    // Import dynamically to avoid circular dependencies
    const { SLACK_TOKEN, SLACK_USER_IDS } = await import('$env/static/private')
    const { fetchUserDetails, fetchUserMessages } = await import(
      '$lib/server/slack'
    )
    const { getUsers } = await import('$lib/server/db')

    const userIds = SLACK_USER_IDS.split(',').map((id) => id.trim())

    // First check if we have users in the database
    let users = getUsers()

    // If no users in DB, fetch them from Slack
    if (users.length === 0) {
      // Fetch user details from Slack
      const userPromises = userIds.map((id) =>
        fetchUserDetails(SLACK_TOKEN, id),
      )
      users = await Promise.all(userPromises)
    } else {
      // Make sure all configured users are in the database
      const existingUserIds = users.map((u) => u.id)
      const missingUserIds = userIds.filter(
        (id) => !existingUserIds.includes(id),
      )

      if (missingUserIds.length > 0) {
        const newUserPromises = missingUserIds.map((id) =>
          fetchUserDetails(SLACK_TOKEN, id),
        )
        const newUsers = await Promise.all(newUserPromises)
        users = [...users, ...newUsers]
      }
    }

    // Configure the Slack client
    const config = {
      token: SLACK_TOKEN,
      users,
    }

    // Fetch new message data from Slack (incremental update)
    await fetchUserMessages(config)

    return {
      success: true,
      timestamp: Date.now(),
    }
  },
}
