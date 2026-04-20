'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tofu' | 'mofu' | 'bofu'
type Tamanho = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  carregando?: boolean
  icone?: React.ReactNode
  iconeDir?: React.ReactNode
}

const estilosVariante: Record<Variante, string> = {
  primary:   'bg-green text-bg font-semibold hover:bg-green-2 border border-green/80',
  secondary: 'bg-raised text-ink-2 hover:text-ink hover:bg-overlay border border-line hover:border-line-2',
  ghost:     'bg-transparent text-ink-3 hover:text-ink-2 hover:bg-raised border border-transparent',
  danger:    'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30',
  tofu:      'bg-tofu/10 text-tofu hover:bg-tofu/15 border border-tofu/20',
  mofu:      'bg-mofu/10 text-mofu hover:bg-mofu/15 border border-mofu/20',
  bofu:      'bg-green/10 text-green hover:bg-green/15 border border-green/20',
}

const estilosTamanho: Record<Tamanho, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5 rounded',
  md: 'h-8 px-3.5 text-sm gap-2 rounded',
  lg: 'h-10 px-5 text-sm gap-2 rounded',
}

export default function Button({
  variante = 'primary', tamanho = 'md', carregando = false,
  icone, iconeDir, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || carregando ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      className={twMerge(clsx(
        'inline-flex items-center justify-center font-medium transition-colors duration-100 cursor-pointer select-none',
        estilosVariante[variante],
        estilosTamanho[tamanho],
        (disabled || carregando) && 'opacity-40 cursor-not-allowed',
        className
      ))}
      disabled={disabled || carregando}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {carregando ? (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icone}
      {children}
      {!carregando && iconeDir}
    </motion.button>
  )
}
