import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card } from '../ui/card'

interface RevenueDataPoint {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#E11D2E]/30 bg-[#1C1C1F] p-3 shadow-xl text-xs">
        <p className="text-zinc-400 font-medium">{label}</p>
        <p className="text-[#E11D2E] font-bold text-sm mt-0.5">
          रू {payload[0].value.toLocaleString('en-NP')}
        </p>
      </div>
    )
  }
  return null
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Revenue Over Time',
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-white mb-6">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E11D2E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E11D2E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.6} />
            <XAxis dataKey="month" stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#262626' }} />
            <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={{ stroke: '#262626' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#E11D2E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
