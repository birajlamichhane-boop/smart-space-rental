import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx('skeleton-shimmer rounded-md bg-[#1C1C1F]', className)
      )}
      {...props}
    />
  )
}
