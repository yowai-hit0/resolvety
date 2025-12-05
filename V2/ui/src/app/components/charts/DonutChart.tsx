'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ['#0f36a5', '#f24d12', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function DonutChart({ data, height = 300, colors = DEFAULT_COLORS }: DonutChartProps) {
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  const chartSeries = data.map((item) => item.value);
  const chartLabels = data.map((item) => item.name);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: height,
      fontFamily: 'Source Sans Pro, sans-serif',
    },
    colors: colors.slice(0, data.length),
    labels: chartLabels,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro, sans-serif',
        fontWeight: 500,
      },
      formatter: (val: number) => {
        return `${val.toFixed(0)}%`;
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Source Sans Pro, sans-serif',
              fontWeight: 600,
              color: '#111827',
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: 'Source Sans Pro, sans-serif',
              fontWeight: 700,
              color: '#111827',
              formatter: (val: string) => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                const value = (parseFloat(val) / 100) * total;
                return Math.round(value).toLocaleString();
              },
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontFamily: 'Source Sans Pro, sans-serif',
              fontWeight: 600,
              color: '#6b7280',
              formatter: () => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontFamily: 'Source Sans Pro, sans-serif',
      labels: {
        colors: '#6b7280',
      },
      markers: {
        size: 8,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro, sans-serif',
      },
      y: {
        formatter: (val: number) => {
          const total = data.reduce((sum, item) => sum + item.value, 0);
          const percent = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
          return `${val.toLocaleString()} (${percent}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Chart
        options={options}
        series={chartSeries}
        type="donut"
        height={height}
      />
    </div>
  );
}

