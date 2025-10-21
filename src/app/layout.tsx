import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Simply QR - QR Code Management Platform',
  description: 'Generate, manage, and track QR codes with advanced analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get publishable key, with empty string fallback for build time
  // Cloudflare Pages will inject the actual value at runtime
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

  return (
    <ClerkProvider
      publishableKey={publishableKey}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
