import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import ReduxProvider from "@/redux/ReduxProvider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Luminique - Admin",
  description: "Admin Dashboard for Luminique",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ReduxProvider>
          {children}
          <Toaster position="top-center" />
        </ReduxProvider>
      </body>
    </html>
  )
}
