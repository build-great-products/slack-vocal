import { html } from "htm/preact";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

type ChartProps = {
	chartData: {
		[key: string]: {
			data: Array<{ date: string; value: number }>;
			series: Array<{
				dataKey: string;
				type: string;
				name: string;
				stroke: string;
				fill: string;
				fillOpacity: number;
				activeDot?: { r: number };
			}>;
		};
	};
	period: string;
};

// Recharts component for our chart
function Chart(props: ChartProps) {
	const { chartData, period } = props;
	const { data: chartPoints, series } = chartData[period];

	return html`
    <${ResponsiveContainer} width="100%" height={400}>
      <${AreaChart}
        data=${chartPoints}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <${CartesianGrid} strokeDasharray="3 3" />
        <${XAxis} dataKey="date" />
        <${YAxis} allowDecimals={false} />
        <${Tooltip} />
        <${Legend} />
        ${series.map(
					(s) => html`
          <${Area}
            key=${s.dataKey}
            type=${s.type}
            dataKey=${s.dataKey}
            name=${s.name}
            stroke=${s.stroke}
            fill=${s.fill}
            fillOpacity=${s.fillOpacity}
            connectNulls
            activeDot=${s.activeDot}
          />
        `,
				)}
      </${AreaChart}>
    </${ResponsiveContainer}>
  `;
}

export { Chart };
