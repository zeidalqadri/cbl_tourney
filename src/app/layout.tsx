import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | MSS Melaka Basketball Tournament 2025',
    default: 'MSS Melaka Basketball Tournament 2025'
  },
  description: 'Official reporting system for MSS Negeri Melaka U12 Basketball Tournament',
  keywords: ['basketball', 'tournament', 'malaysia', 'melaka', 'sports', 'MSS', 'U12'],
  authors: [{ name: 'Tournament Organization Team' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'MSS Melaka Basketball Tournament 2025',
    locale: 'en_MY',
    title: 'MSS Melaka Basketball Tournament 2025',
    description: 'Official reporting system for MSS Negeri Melaka U12 Basketball Tournament',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#40E0D0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}