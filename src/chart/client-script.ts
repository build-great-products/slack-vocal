export function generateClientScript(chartData: Record<string, unknown>) {
	return `
    // Import Preact and Recharts
    import { h, render, hydrate } from 'https://esm.sh/preact@10.26.4';
    import { html } from 'https://esm.sh/htm@3.1.1/preact';
    import { useEffect, useState, useRef } from 'https://esm.sh/preact@10.26.4/hooks';
    import {
      AreaChart, Area, XAxis, YAxis, CartesianGrid,
      Tooltip, Legend, ResponsiveContainer
    } from 'https://esm.sh/recharts@2.15.1';
    
    // Store all datasets
    const chartData = ${JSON.stringify(chartData)};
    
    // Recharts component for our chart
    function Chart({ data, period }) {
      const { data: chartPoints, series } = chartData[period];
      
      return html\`
        <\${ResponsiveContainer} width="100%" height={400}>
          <\${AreaChart}
            data=\${chartPoints}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <\${CartesianGrid} strokeDasharray="3 3" />
            <\${XAxis} dataKey="date" />
            <\${YAxis} allowDecimals={false} />
            <\${Tooltip} />
            <\${Legend} />
            \${series.map(s => html\`
              <\${Area}
                key=\${s.dataKey}
                type=\${s.type}
                dataKey=\${s.dataKey}
                name=\${s.name}
                stroke=\${s.stroke}
                fill=\${s.fill}
                fillOpacity=\${s.fillOpacity}
                connectNulls
                activeDot=\${s.activeDot}
              />
            \`)}
          </\${AreaChart}>
        </\${ResponsiveContainer}>
      \`;
    }
    
    // Chart component wrapper
    function ChartComponent({ activeTimeUnit }) {
      return html\`
        <div className="chart-container">
          <\${Chart} period=\${activeTimeUnit} />
        </div>
      \`;
    }
    
    // Time period selector component
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
    
    // Main app component
    function App() {
      const [activeTimeUnit, setActiveTimeUnit] = useState("day");
      
      const handleTimeUnitChange = (period) => {
        if (activeTimeUnit !== period) {
          setActiveTimeUnit(period);
        }
      };
      
      return html\`
        <div className="container">
          <h1>Slack Message Activity (Last 90 Days)</h1>
          <\${TimeSelector} activeTimeUnit=\${activeTimeUnit} onTimeUnitChange=\${handleTimeUnitChange} />
          <\${ChartComponent} activeTimeUnit=\${activeTimeUnit} />
        </div>
      \`;
    }
    
    // Hydrate the server-rendered app
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('.container');
      // Pass the chartData so the client has access to it
      hydrate(h(App, {}), container.parentNode, container);
    });
  `;
}
