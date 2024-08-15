import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../app/contexts/ThemeProvider'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Worthy.ai - Your Media Buying Co-Pilot',
  description: 'AI-powered optimization for your Facebook ad campaigns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <ThemeProvider>
          <body className={inter.className}>{children}</body>
        </ThemeProvider>
      </Providers>
    </html>
  )
}