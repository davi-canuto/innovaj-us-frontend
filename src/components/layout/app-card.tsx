"use client"
import * as React from "react"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils";

interface CardProps {
    title: string,
    description: string,
    icon?: LucideIcon,
    color?: string

}

export function AppCard({
    title,
    description,
    icon: Icon,
    color
}: CardProps) {

    return (
        <Card>
            <CardHeader>
                <CardDescription>{description}</CardDescription>

                <CardTitle className={cn("text-3xl", color)}>{title}</CardTitle>
                <CardAction>

                    {Icon &&
                        <div className=" rounded-full ">
                            <Icon className={cn("w-5 h-5", color)} />
                        </div>
                    }
                </CardAction>
            </CardHeader>
        </Card>
    )
}
