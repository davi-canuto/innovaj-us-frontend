"use client"
import * as React from "react"
import { Check, ClipboardList, Footprints } from "lucide-react"
import { AppCard } from "./app-card"



export function DashboardCards() {
    return (
        <div className="mt-[36px] grid grid-cols-1 md:grid-cols-4 gap-6 ">
            <AppCard title={"181"} description={"Total de precatórios"} icon={ClipboardList} color={""} />
            <AppCard title={"134"} description={"Precatórios finalizados"} icon={Check} color={""} />
            <AppCard title={"47"} description={"Precatórios em andamento"} icon={Footprints} color={""} />
            <AppCard title={"R$ 230.200"} description={"Valor Total Estimado"} color={""} />
            <AppCard title={"R$ 100.200"} description={"Desembolsado no Período (Ult. 30 dias)"} color={""} />
        </div>
    )
}
