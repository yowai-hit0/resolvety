'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AreaChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

export default function AreaChart({ data, dataKey, series, height = 300 }: AreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  const colorPalette = ['#0f36a5', '#f24d12', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const chartSeries = series.map((s) => ({
    name: s.name,
    data: data.map((item) => item[s.key] || 0),
  }));

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: height,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: 'Source Sans Pro, sans-serif',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: series.map((s, index) => s.color || colorPalette[index % colorPalette.length]),
    xaxis: {
      categories: data.map((item) => item[dataKey]),
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontFamily: 'Source Sans Pro, sans-serif',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontFamily: 'Source Sans Pro, sans-serif',
        },
        formatter: (value: number) => {
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
          return value.toString();
        },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Source Sans Pro, sans-serif',
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'Source Sans Pro, sans-serif',
      labels: {
        colors: '#6b7280',
      },
      markers: {
        size: 8,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Chart
        options={options}
        series={chartSeries}
        type="area"
        height={height}
      />
    </div>
  );
}

