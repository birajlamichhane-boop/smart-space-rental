import React from 'react'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0A0A0B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 relative overflow-hidden">
        {/* Ambient static red glow behind stat row */}
        <div className="ambient-glow -top-20 -left-20" />

        {/* Dashboard Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>

        {/* Dashboard Main Content */}
        <div className="relative z-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
