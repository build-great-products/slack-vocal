import { eachDayOfInterval, format, parseISO, subDays, startOfWeek, startOfMonth, getWeek, getMonth, getYear } from "date-fns";
import type { UserInfo, UserMessageCounts } from "./types.ts";

// Colorblind-friendly palette (Wong, 2011)
// Limited to 5 distinct colors that are distinguishable by colorblind people
const COLORBLIND_FRIENDLY_COLORS = [
	"rgba(0, 114, 178, 0.6)", // blue
	"rgba(230, 159, 0, 0.6)", // orange
	"rgba(0, 158, 115, 0.6)", // green
	"rgba(204, 121, 167, 0.6)", // purple
	"rgba(213, 94, 0, 0.6)", // vermillion/red
];

interface AggregatedData {
	labels: string[];
	datasets: any[];
}

export function generateHtmlChart(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
): string {
	// Check if we have too many users for our colorblind palette
	if (users.length > COLORBLIND_FRIENDLY_COLORS.length) {
		throw new Error(
			`Too many users (${users.length}). Maximum ${COLORBLIND_FRIENDLY_COLORS.length} users supported for colorblind-friendly visualization.`,
		);
	}

	// Generate an array of all days in the 90-day interval
	const endDate = new Date();
	const startDate = subDays(endDate, 90);

	const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(
		(date) => format(date, "yyyy-MM-dd"),
	);

	// Prepare the daily data (original)
	const dailyData = prepareChartData(userMessageCounts, users, allDays, 'day');
	
	// Prepare weekly data
	const weeklyData = aggregateByTimeUnit(userMessageCounts, users, allDays, 'week');
	
	// Prepare monthly data
	const monthlyData = aggregateByTimeUnit(userMessageCounts, users, allDays, 'month');

	// Create HTML content with Chart.js
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slack Message Activity</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #1a1a1a;
    }
    .chart-container {
      height: 500px;
      margin-top: 20px;
    }
    .time-selector {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      gap: 10px;
    }
    .time-button {
      padding: 8px 16px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .time-button:hover {
      background-color: #e0e0e0;
    }
    .time-button.active {
      background-color: #4a90e2;
      color: white;
      border-color: #3a80d2;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Slack Message Activity (Last 90 Days)</h1>
    
    <div class="time-selector">
      <button class="time-button active" data-period="day">Daily</button>
      <button class="time-button" data-period="week">Weekly</button>
      <button class="time-button" data-period="month">Monthly</button>
    </div>
    
    <div class="chart-container">
      <canvas id="messageChart"></canvas>
    </div>
  </div>

  <script>
    // Store all datasets
    const chartData = {
      day: {
        labels: ${JSON.stringify(dailyData.labels)},
        datasets: ${JSON.stringify(dailyData.datasets)}
      },
      week: {
        labels: ${JSON.stringify(weeklyData.labels)},
        datasets: ${JSON.stringify(weeklyData.datasets)}
      },
      month: {
        labels: ${JSON.stringify(monthlyData.labels)},
        datasets: ${JSON.stringify(monthlyData.datasets)}
      }
    };
    
    // Create the chart
    const ctx = document.getElementById('messageChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: chartData.day,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            stacked: false,
            title: {
              display: true,
              text: 'Number of Messages'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
    
    // Add event listeners to time selector buttons
    document.querySelectorAll('.time-button').forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.time-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get the time period
        const period = this.getAttribute('data-period');
        
        // Update chart data
        chart.data.labels = chartData[period].labels;
        chart.data.datasets = chartData[period].datasets;
        
        // Update title text based on period
        let titleText = 'Date';
        if (period === 'week') {
          titleText = 'Week';
        } else if (period === 'month') {
          titleText = 'Month';  
        }
        chart.options.scales.x.title.text = titleText;
        
        // Update chart
        chart.update();
      });
    });
  </script>
</body>
</html>
  `;
}

// Helper function to prepare chart data for each user
function prepareChartData(
	userMessageCounts: UserMessageCounts, 
	users: UserInfo[], 
	dates: string[],
	timeUnit: string
): AggregatedData {
	const datasets = users.map((user, index) => {
		const messageCounts = userMessageCounts[user.id] || {};
		const userData = dates.map((date) => messageCounts[date] || 0);
		const color = COLORBLIND_FRIENDLY_COLORS[index];
		const borderColor = color.replace("0.6", "1");

		return {
			label: user.name,
			data: userData,
			backgroundColor: color,
			borderColor: borderColor,
			borderWidth: 2,
			tension: 0.1,
			pointRadius: 3,
			pointHoverRadius: 5,
			pointBackgroundColor: borderColor,
			fill: false
		};
	});

	return {
		labels: dates,
		datasets
	};
}

// Helper function to aggregate data by week or month
function aggregateByTimeUnit(
	userMessageCounts: UserMessageCounts, 
	users: UserInfo[], 
	dates: string[],
	timeUnit: 'week' | 'month'
): AggregatedData {
	// Create aggregation buckets
	const aggregatedCounts: Record<string, Record<string, number>> = {};
	const timeLabels: string[] = [];
	const timeMap: Record<string, string> = {};

	// Initialize aggregation buckets for each user
	users.forEach(user => {
		aggregatedCounts[user.id] = {};
	});

	// Aggregate data by the specified time unit
	dates.forEach(dateStr => {
		const date = parseISO(dateStr);
		let timeKey: string;
		let displayLabel: string;

		if (timeUnit === 'week') {
			const weekNum = getWeek(date);
			const year = getYear(date);
			timeKey = `${year}-W${weekNum}`;
			displayLabel = `Week ${weekNum}, ${year}`;
		} else { // month
			const monthNum = getMonth(date) + 1; // getMonth is 0-indexed
			const year = getYear(date);
			timeKey = `${year}-${monthNum.toString().padStart(2, '0')}`;
			displayLabel = `${format(date, 'MMMM yyyy')}`;
		}

		// Add to timeLabels if not already present
		if (!timeMap[timeKey]) {
			timeMap[timeKey] = displayLabel;
			timeLabels.push(timeKey);
		}

		// Aggregate message counts for each user
		users.forEach(user => {
			const messageCounts = userMessageCounts[user.id] || {};
			const count = messageCounts[dateStr] || 0;
			
			aggregatedCounts[user.id][timeKey] = (aggregatedCounts[user.id][timeKey] || 0) + count;
		});
	});

	// Sort time labels chronologically
	timeLabels.sort();

	// Convert to display labels
	const displayLabels = timeLabels.map(key => timeMap[key]);

	// Create datasets for chart
	const datasets = users.map((user, index) => {
		const userData = timeLabels.map(timeKey => aggregatedCounts[user.id][timeKey] || 0);
		const color = COLORBLIND_FRIENDLY_COLORS[index];
		const borderColor = color.replace("0.6", "1");

		return {
			label: user.name,
			data: userData,
			backgroundColor: color,
			borderColor: borderColor,
			borderWidth: 2,
			tension: 0.1,
			pointRadius: 3,
			pointHoverRadius: 5,
			pointBackgroundColor: borderColor,
			fill: false
		};
	});

	return {
		labels: displayLabels,
		datasets
	};
}