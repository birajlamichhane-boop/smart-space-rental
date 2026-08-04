import React from 'react'
import { clsx } from 'clsx'

interface Tab {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-[#262626] gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative py-3 px-4 text-sm font-medium transition-colors flex items-center gap-2',
              isActive
                ? 'text-[#E11D2E] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 text-xs rounded-full',
                  isActive
                    ? 'bg-[#E11D2E]/20 text-[#E11D2E]'
                    : 'bg-zinc-800 text-zinc-400'
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E11D2E] shadow-[0_0_8px_rgba(225,29,46,0.8)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
