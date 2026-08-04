import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  // Count up animation on initial mount only
  useEffect(() => {
    let start = 0
    const duration = 800
    const increment = value / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  return (
    <Card hoverable className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2 tracking-tight">
            {prefix}{displayValue.toLocaleString()}{suffix}
          </h3>
          {trend && (
            <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#E11D2E]/10 border border-[#E11D2E]/20 flex items-center justify-center text-[#E11D2E]">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}
