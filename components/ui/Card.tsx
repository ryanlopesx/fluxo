'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  corBorda?: string
}

export default function Card({ children, className, hover = false, onClick, corBorda }: CardProps) {
  const estiloBorda = corBorda ? { borderLeftColor: corBorda, borderLeftWidth: 3 } : {}

  return (
    <div
      onClick={onClick}
      style={estiloBorda}
      className={twMerge(clsx(
        'bg-surface border border-line rounded p-4 transition-colors duration-150',
        hover && 'cursor-pointer hover:border-line-2 hover:bg-raised',
        className
      ))}
    >
      {children}
    </div>
  )
}
