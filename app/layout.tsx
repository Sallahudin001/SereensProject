import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import ScrollToTop from "@/components/scroll-to-top"
import { ClerkClientProvider } from "@/components/clerk-provider"
import UserSyncProvider from "@/components/user-sync-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EverGreen Home Proposals",
  description: "Professional proposal generation tool for home improvement contractors",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <ClerkClientProvider>
          <UserSyncProvider>
            {children}
            <ScrollToTop />
            <Toaster />
          </UserSyncProvider>
        </ClerkClientProvider>
      </body>
    </html>
  )
}
