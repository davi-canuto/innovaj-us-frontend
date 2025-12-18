"use client"

import * as React from "react"
import Image from "next/image";

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
    {
      title: "Precatórios",
      url: "/precatory/list",
      icon: CircleDollarSign,
      isActive: true,
      items: [
        {
          title: "Cadastrar",
          url: "/precatory/new",
        },
        {
          title: "Listar",
          url: "/precatory/list",
        },
      ],
    },
    {
      title: "Credores",
      url: "/claimant/list",
      icon: Users,
      items: [
        {
          title: "Cadastrar",
          url: "/claimant/new",
        },
        {
          title: "Listar",
          url: "/claimant/list",
        },
      ],
    },
    {
      title: "Devedores",
      url: "/debtor",
      icon: Landmark
    },
    {
      title: "Relatorios",
      url: "/dashboard",
      icon: FileText,

    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <Image
          className="dark:invert"
          src="/sidebar-logo.png"
          alt="InnovaJus logo"
          width={366}
          height={160}
          priority
        />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
