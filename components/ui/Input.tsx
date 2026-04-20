'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  erro?: string
  icone?: React.ReactNode
}

export default function Input({ label, erro, icone, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icone && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icone}
          </div>
        )}
        <input
          className={twMerge(
            clsx(
              'w-full h-10 rounded-lg bg-elevated border border-border text-primary text-sm placeholder:text-muted',
              'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors duration-150',
              icone ? 'pl-10 pr-3' : 'px-3',
              erro && 'border-red-700/60 focus:border-red-600/60 focus:ring-red-600/20',
              className
            )
          )}
          {...props}
        />
      </div>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  )
}
