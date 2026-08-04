import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E11D2E]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'
    
    const variants = {
      primary: 'bg-[#E11D2E] text-white hover:bg-[#FF2E44] shadow-[0_0_20px_rgba(225,29,46,0.35)] hover:scale-[1.02]',
      outline: 'bg-transparent border border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-[#1C1C1F]',
      ghost: 'bg-transparent text-zinc-300 hover:text-white hover:bg-[#1C1C1F]',
      danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-md',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base font-semibold',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
