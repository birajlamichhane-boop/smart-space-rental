import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-lg border border-[#262626] bg-[#141416] px-3.5 py-2 text-sm text-zinc-100 transition-colors focus:border-[#E11D2E] focus:outline-none focus:ring-2 focus:ring-[#E11D2E]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/60',
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#141416] text-zinc-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
