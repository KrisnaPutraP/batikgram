import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BatikGram - Experience Batik Culture Virtually",
  description:
    "Rasakan Keindahan Batik Jawa Tradisional dengan Teknologi AR. Coba berbagai motif batik secara virtual dan pelajari sejarah budaya Indonesia.",
  keywords: "batik, indonesia, AR, virtual reality, budaya, tradisional, motif batik, yogyakarta",
  authors: [{ name: "BatikGram Team" }],
  openGraph: {
    title: "BatikGram - Experience Batik Culture Virtually",
    description: "Rasakan Keindahan Batik Jawa Tradisional dengan Teknologi AR",
    type: "website",
    locale: "id_ID",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
