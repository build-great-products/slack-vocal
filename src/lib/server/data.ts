import { eachDayOfInterval, format } from 'date-fns'

import type { UserInfo, UserMessageCounts, ChartData } from './types.js'

type PrepareChartDataOptions = {
  userMessageCounts: UserMessageCounts
  users: UserInfo[]
  startDate: Date
  endDate: Date
}

// Prepare daily chart data
function prepareChartData(options: PrepareChartDataOptions): ChartData {
  const { userMessageCounts, users, startDate, endDate } = options

  const defaultValues = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.id] = 0
    return acc
  }, {})

  const dates = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => format(date, 'yyyy-MM-dd'),
  )

  const chartDataByDate = new Map<string, Record<string, number>>()

  for (const user of users) {
    const messageCounts = userMessageCounts[user.id] || {}

    for (const date of dates) {
      const count = messageCounts[date] || 0
      if (!chartDataByDate.has(date)) {
        chartDataByDate.set(date, {})
      }
      chartDataByDate.get(date)![user.id] = count
    }
  }

  const chartData: ChartData = []
  for (const date of dates) {
    const values = chartDataByDate.get(date) ?? defaultValues
    chartData.push({ ...values, date })
  }

  return chartData
}

export { prepareChartData }
