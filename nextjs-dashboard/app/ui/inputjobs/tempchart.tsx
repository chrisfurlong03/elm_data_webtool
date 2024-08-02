import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables, ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter

ChartJS.register(...registerables);

interface TemperatureChartProps {
  data: (number | string)[];
  dataLable: (string);
  title: (string);
  ytitle: (string);
}


const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, dataLable, title, ytitle }) => {
  // Function to generate time intervals
  const generateTimeIntervals = (startYear: number, endYear: number): string[] => {
    const intervals: string[] = [];
    const startDate = new Date(`${startYear}-01-01T00:15:00`);
    const endDate = new Date(`${endYear}-12-31T23:45:00`);
    let currentDate = startDate;

    while (currentDate <= endDate) {
      intervals.push(currentDate.toISOString().slice(0, 19).replace('T', ' '));
      currentDate.setMinutes(currentDate.getMinutes() + 30); // Add 30 minutes
    }

    return intervals;
  };

  // Generate time intervals for 2016
  const timeIntervals = generateTimeIntervals(2016, 2016);

  // Match TA values with time intervals, replacing "NA" with null
  const taValues = data.map(value => (value === "NA" ? null : value));

  const chartData = {
    labels: timeIntervals,
    datasets: [
      {
        label: dataLable,
        data: taValues,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
        spanGaps: false,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: ytitle,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    maintainAspectRatio: false,
  };

  // Custom plugin for highlighting missing data
  const highlightMissingDataPlugin = {
    id: 'highlight-missing-data',
    afterDraw: (chart: any) => {
      const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 99, 132, 0.6)'; // Faint red color

      let startIndex: number | null = null;

      // Iterate over the data to find missing values
      taValues.forEach((value, index) => {
        if (value === null && startIndex === null) {
          startIndex = index;
        } else if (value !== null && startIndex !== null) {
          const startX = x.getPixelForValue(timeIntervals[startIndex]);
          const endX = x.getPixelForValue(timeIntervals[index]);
          ctx.fillRect(startX, top, endX - startX, bottom - top);
          console.log(`Drawing rect from ${startX} to ${endX}`); // Debugging
          startIndex = null;
        }
      });

      // Check if the last segment is a missing data section
      if (startIndex !== null) {
        const startX = x.getPixelForValue(startIndex);
        const endX = x.getPixelForValue(taValues.length - 1);
        ctx.fillRect(startX, top, endX - startX, bottom - top);
      }

      ctx.restore();
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Line
        data={chartData}
        options={chartOptions}
        plugins={[highlightMissingDataPlugin]}
      />
    </div>
  );
};

export default TemperatureChart;

