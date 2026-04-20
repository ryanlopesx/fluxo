import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'FLUXO — Roteiros que Vendem',
  description: 'Plataforma de geração de roteiros de Reels por estágio de funil, com IA e metodologia comprovada.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-bg text-ink font-sans antialiased min-h-screen">
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
