import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-lg border border-[#262626] bg-[#141416] px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-[#E11D2E] focus:outline-none focus:ring-2 focus:ring-[#E11D2E]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/60',
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
