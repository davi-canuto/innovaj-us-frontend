"use client"

import * as React from "react"
import { Check, ClipboardList, Footprints } from "lucide-react"
import { AppCard } from "./app-card"
import { DashboardStats } from "@/lib/actions/dashboard"

interface DashboardCardsProps {
    stats: DashboardStats
}

export function DashboardCards({ stats }: DashboardCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <AppCard
                title={stats.total.toString()}
                description={"Total de precatórios"}
                icon={ClipboardList}
                color={""}
            />
            <AppCard
                title={stats.finalizados.toString()}
                description={"Precatórios finalizados"}
                icon={Check}
                color={""}
            />
            <AppCard
                title={stats.emAndamento.toString()}
                description={"Precatórios em andamento"}
                icon={Footprints}
                color={""}
            />
            <AppCard
                title={`R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description={"Valor Total Estimado"}
                color={""}
            />
            <AppCard
                title={`R$ ${stats.desembolsado30Dias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description={"Desembolsado no Período (Ult. 30 dias)"}
                color={""}
            />
        </div>
    )
}
