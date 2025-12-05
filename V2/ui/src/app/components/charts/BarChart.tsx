'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  bars: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

export default function BarChart({ data, dataKey, bars, height = 300 }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  const colorPalette = ['#181E29', '#1a74e8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={dataKey} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => {
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toString();
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          {bars.length > 1 && <Legend />}
          {bars.map((bar, index) => (
            <Bar 
              key={bar.key}
              dataKey={bar.key} 
              name={bar.name}
              fill={bar.color || colorPalette[index % colorPalette.length]}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

