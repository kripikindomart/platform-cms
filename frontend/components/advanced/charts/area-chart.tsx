'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * AreaChart - Premium area chart using Recharts
 */

export interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartData[];
  areas: {
    dataKey: string;
    stroke: string;
    fill: string;
    name?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
}

export function AreaChart({
  data,
  areas,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  stacked = false,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={area.stroke} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />}
        <XAxis
          dataKey="name"
          stroke="#737373"
          style={{ fontSize: '12px', fontWeight: '500' }}
        />
        <YAxis stroke="#737373" style={{ fontSize: '12px', fontWeight: '500' }} />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ fontWeight: '600', color: '#171717', marginBottom: '4px' }}
            itemStyle={{ fontSize: '14px', fontWeight: '500' }}
          />
        )}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#525252', fontWeight: '500' }}>{value}</span>}
          />
        )}
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            stroke={area.stroke}
            fill={`url(#gradient-${index})`}
            strokeWidth={2}
            name={area.name || area.dataKey}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
