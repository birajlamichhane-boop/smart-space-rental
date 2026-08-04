import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled' | 'neutral';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  pulse = false,
  ...props
}) => {
  const isPending = variant === 'pending'
  const isPulse = pulse || isPending

  const variantStyles = {
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    neutral: 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50',
  }

  const dotColor = {
    pending: 'bg-amber-400',
    approved: 'bg-emerald-400',
    confirmed: 'bg-emerald-400',
    rejected: 'bg-rose-400',
    cancelled: 'bg-rose-400',
    neutral: 'bg-zinc-400',
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
          variantStyles[variant],
          isPulse && 'animate-pulse-slow',
          className
        )
      )}
      {...props}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', dotColor[variant])} />
      {children}
    </span>
  )
}
