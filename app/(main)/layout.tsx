import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import '../globals.css'
import AppSidebar from '@/components/appSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Supabase login',
  description: 'Test field for Supabase login',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <div className="flex w-screen h-screen">
            <AppSidebar />

            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-6">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
