import type { Metadata } from 'next'
import { Inter, Caveat } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })

export const metadata: Metadata = {
  title: 'SignProz | Smart eSignature Platform',
  description: 'Prepare, send, sign, and track agreements at scale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
