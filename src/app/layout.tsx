import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "InnovaJus",
  description: "Sistema de gestão jurídica",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
