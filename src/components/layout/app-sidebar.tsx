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
      url: "#",
      icon: CircleDollarSign,
      isActive: true,
      items: [
        {
          title: "Cadastrar",
          url: "#",
        },
        {
          title: "Listar",
          url: "#",
        },
      ],
    },
    {
      title: "Credores",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Cadastrar",
          url: "#",
        },
        {
          title: "Listar",
          url: "#",
        },
      ],
    },
    {
      title: "Devedores",
      url: "#",
      icon: Landmark
    },
    {
      title: "Relatorios",
      url: "#",
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
