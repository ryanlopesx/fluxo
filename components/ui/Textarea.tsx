'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useEffect, useRef, useState } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  erro?: string
  placeholders?: string[]
}

export default function Textarea({ label, erro, placeholders, className, placeholder, ...props }: TextareaProps) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisivel, setPlaceholderVisivel] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Anima o placeholder em crossfade a cada 4s se houver lista de placeholders
  useEffect(() => {
    if (!placeholders || placeholders.length <= 1) return
    intervalRef.current = setInterval(() => {
      setPlaceholderVisivel(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % placeholders.length)
        setPlaceholderVisivel(true)
      }, 300)
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [placeholders])

  const placeholderAtual = placeholders
    ? placeholders[placeholderIdx]
    : placeholder

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          className={twMerge(
            clsx(
              'w-full rounded-lg bg-elevated border border-border text-primary text-sm placeholder:text-muted',
              'focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30',
              'transition-all duration-150 resize-none p-3 leading-relaxed',
              placeholderVisivel ? 'placeholder:opacity-100' : 'placeholder:opacity-0',
              'placeholder:transition-opacity placeholder:duration-300',
              erro && 'border-red-700/60 focus:border-red-600/60 focus:ring-red-600/20',
              className
            )
          )}
          placeholder={placeholderAtual}
          {...props}
        />
      </div>
      {erro && <p className="text-xs text-red-400">{erro}</p>}
    </div>
  )
}
