'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/slack/common/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
 return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}