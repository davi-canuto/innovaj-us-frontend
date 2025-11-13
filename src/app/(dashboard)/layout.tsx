import type { Metadata } from "next"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"


export const metadata: Metadata = {
  title: "InnovaJus",
  description: "Dashboard layout with shadcn sidebar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <html lang="en">
      <body
        className={`antialiased w-full h-screen`}
      >

        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <div className="flex w-full flex-col ">
              <SiteHeader />
              <main className="flex-1 p-6 space-y-6 ">
                {children}
              </main>
            </div>

          </div>
        </SidebarProvider>

        <Toaster richColors position="top-center" expand={false} />
      </body>
    </html>
  )
}


