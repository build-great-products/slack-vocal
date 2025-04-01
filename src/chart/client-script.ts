export function generateClientScript(chartData: Record<string, unknown>) {
	return `
    // Import Preact
    import { h, render, hydrate } from 'https://esm.sh/preact@10.26.4';
    import { html } from 'https://esm.sh/htm@3.1.1/preact';
    import { useEffect, useState } from 'https://esm.sh/preact@10.26.4/hooks';
    
    // Store all datasets
    const chartData = ${JSON.stringify(chartData)};
    let chart;
    
    // Create Preact components
    function ChartComponent() {
      useEffect(() => {
        // Initialize Chart.js after component mounts
        const ctx = document.getElementById('messageChart').getContext('2d');
        chart = new Chart(ctx, {
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
        
        // Cleanup when component unmounts
        return () => {
          if (chart) {
            chart.destroy();
          }
        };
      }, []);
      
      return html\`
        <div className="chart-container">
          <canvas id="messageChart" />
        </div>
      \`;
    }
    
    function TimeSelector({ activeTimeUnit, onTimeUnitChange }) {
      return html\`
        <div className="time-selector">
          <button
            type="button"
            className=\${\`time-button \${activeTimeUnit === "day" ? "active" : ""}\`}
            data-period="day"
            onClick=\${() => onTimeUnitChange("day")}
          >
            Daily
          </button>
          <button
            type="button"
            className=\${\`time-button \${activeTimeUnit === "week" ? "active" : ""}\`}
            data-period="week"
            onClick=\${() => onTimeUnitChange("week")}
          >
            Weekly
          </button>
          <button
            type="button"
            className=\${\`time-button \${activeTimeUnit === "month" ? "active" : ""}\`}
            data-period="month"
            onClick=\${() => onTimeUnitChange("month")}
          >
            Monthly
          </button>
        </div>
      \`;
    }
    
    function App() {
      const [activeTimeUnit, setActiveTimeUnit] = useState("day");
      
      const handleTimeUnitChange = (period) => {
        if (activeTimeUnit !== period) {
          setActiveTimeUnit(period);
          
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
        }
      };
      
      return html\`
        <div className="container">
          <h1>Slack Message Activity (Last 90 Days)</h1>
          <\${TimeSelector} activeTimeUnit=\${activeTimeUnit} onTimeUnitChange=\${handleTimeUnitChange} />
          <\${ChartComponent} />
        </div>
      \`;
    }
    
    // Hydrate the server-rendered app
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('.container');
      // Pass the chartData so the client has access to it
      hydrate(h(App, { chartData }), container.parentNode, container);
    });
  `;
}
