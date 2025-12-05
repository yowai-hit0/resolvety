'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  lines: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

export default function LineChart({ data, dataKey, lines, height = 300 }: LineChartProps) {
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
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={dataKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
          <Legend />
          {lines.map((line, index) => (
            <Line 
              key={line.key}
              type="monotone" 
              dataKey={line.key} 
              name={line.name}
              stroke={line.color || colorPalette[index % colorPalette.length]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

