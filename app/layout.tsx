import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
// Inter font for premium typography
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const metadata: Metadata = {
  title: 'SyncTerm',
  description: 'A blazingly fast, client-side university scheduler built for students.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
    ],
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-background font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
