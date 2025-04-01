import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
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

export function generateHtmlChart(
	userMessageCounts: UserMessageCounts,
	users: UserInfo[],
): string {
	// Generate an array of all days in the 90-day interval
	const endDate = new Date();
	const startDate = subDays(endDate, 90);

	const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(
		(date) => format(date, "yyyy-MM-dd"),
	);

	// Check if we have too many users for our colorblind palette
	if (users.length > COLORBLIND_FRIENDLY_COLORS.length) {
		throw new Error(
			`Too many users (${users.length}). Maximum ${COLORBLIND_FRIENDLY_COLORS.length} users supported for colorblind-friendly visualization.`,
		);
	}

	// Create datasets for each user
	const datasets = users.map((user, index) => {
		const messageCounts = userMessageCounts[user.id] || {};
		const userData = allDays.map((date) => messageCounts[date] || 0);
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
			fill: false,
		};
	});

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
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Slack Message Activity (Last 90 Days)</h1>
    <div class="chart-container">
      <canvas id="messageChart"></canvas>
    </div>
  </div>

  <script>
    const dates = ${JSON.stringify(allDays)};
    const datasets = ${JSON.stringify(datasets)};
    
    const ctx = document.getElementById('messageChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: datasets
      },
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
  </script>
</body>
</html>
  `;
}
