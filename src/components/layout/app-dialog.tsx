"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LucideIcon } from "lucide-react"
import { Separator } from "../ui/separator"
import { ReactElement, useState } from "react"
import React from "react"
interface DialogProps {
    title: string,
    content: React.ReactNode,
    trigger: string,
    description?: string,
    icon?: LucideIcon,
}

export function AppDialog({
    title,
    content,
    trigger,
     icon: Icon,
    description
}: DialogProps) {
 
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild className="bg-[#1a384c]  text-white cursor-pointer hover:text-white hover:bg-[#1a384c]">
          <Button variant="outline">{trigger}</Button>
        </DialogTrigger>
        <DialogContent className="w-[90%]">
          <DialogHeader>

            <DialogTitle >
            <div className="text-3xl font-semibold flex items-center space-x-2 mb-2"  >
              {Icon && <Icon strokeWidth={3} className=" text-[#248A61]"/>}
              <h1 className=" text-[#1a384c]">{title}</h1>
            </div>
            <Separator className="my-4" />

            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </form>
    </Dialog>
  )
}
