import { startOfDay, endOfToday, subDays } from 'date-fns'

import { SLACK_TOKEN, SLACK_USER_IDS } from '$env/static/private'

import { fetchUserDetails } from '$lib/server/slack.js'
import { prepareChartData } from '$lib/server/data.js'
import { getUsers, getMessageCountsForTimeRange } from '$lib/server/db.js'

export async function load() {
  // Parse the user IDs from the environment variable
  const userIds = SLACK_USER_IDS.split(',').map((id) => id.trim())

  if (!SLACK_TOKEN || userIds.length === 0) {
    throw new Error(
      'Missing required environment variables: SLACK_TOKEN and/or SLACK_USER_IDS',
    )
  }

  // Get the time window for data
  const numDays = 90
  const endDate = endOfToday()
  const startDate = subDays(startOfDay(endDate), numDays)

  // First check if we have users in the database
  let users = getUsers()

  // If no users in DB, fetch them from Slack
  if (users.length === 0) {
    // Fetch user details from Slack
    const userPromises = userIds.map((id) => fetchUserDetails(SLACK_TOKEN, id))
    users = await Promise.all(userPromises)
  } else {
    // Make sure all configured users are in the database
    // This handles cases where new users were added to the config
    const existingUserIds = users.map((u) => u.id)
    const missingUserIds = userIds.filter((id) => !existingUserIds.includes(id))

    if (missingUserIds.length > 0) {
      const newUserPromises = missingUserIds.map((id) =>
        fetchUserDetails(SLACK_TOKEN, id),
      )
      const newUsers = await Promise.all(newUserPromises)
      users = [...users, ...newUsers]
    }
  }

  // Fetch new message data from Slack (incremental update)
  // await fetchUserMessages({ token: SLACK_TOKEN, users }));

  // Now get the complete dataset from the database
  const userMessageCounts = getMessageCountsForTimeRange({
    startDate,
    endDate,
  })

  // Prepare chart data
  const chartData = prepareChartData({
    userMessageCounts,
    users,
    startDate,
    endDate,
  })

  return {
    chartData,
  }
}
