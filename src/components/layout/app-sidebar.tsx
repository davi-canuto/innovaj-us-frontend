"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import {
  CircleDollarSign,
  Users,
  FileText,
  Landmark
} from "lucide-react"

import { NavMain } from "@/components/ui/sideBar/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "Precatórios", url: "/precatory/list", icon: CircleDollarSign },
    { title: "Credores",    url: "/claimant/list",  icon: Users },
    { title: "Devedores",   url: "/debtor/list",    icon: Landmark },
    { title: "Relatórios",  url: "/dashboard",      icon: FileText },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <Link href="/dashboard">
          <Image
            className="dark:invert"
            src="/sidebar-logo.png"
            alt="InnovaJus logo"
            width={366}
            height={160}
            priority
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
