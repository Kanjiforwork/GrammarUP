import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "../globals.css"

const lexend = Lexend({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Exercise - Grammar UP",
  description: "Full screen exercise mode",
}

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}