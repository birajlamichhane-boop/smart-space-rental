import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card } from '../ui/card'

interface OccupancyDataPoint {
  month: string;
  occupancy: number;
}

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#E11D2E]/30 bg-[#1C1C1F] p-3 shadow-xl text-xs">
        <p className="text-zinc-400 font-medium">{label}</p>
        <p className="text-[#E11D2E] font-bold text-sm mt-0.5">
          {payload[0].value}% Occupancy
        </p>
      </div>
    )
  }
  return null
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({
  data,
  title = 'Occupancy Rate (%)',
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-white mb-6">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.6} />
            <XAxis dataKey="month" stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#262626' }} />
            <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#262626' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="occupancy" fill="#E11D2E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
