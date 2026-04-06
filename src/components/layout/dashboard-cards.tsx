"use client"

import * as React from "react"
import { Check, ClipboardList, TrendingUp, Wallet } from "lucide-react"
import { AppCard } from "./app-card"
import { DashboardStats } from "@/lib/actions/dashboard"

interface DashboardCardsProps {
    stats: DashboardStats
}

export function DashboardCards({ stats }: DashboardCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AppCard
                title={stats.total.toString()}
                description={"Total de precatórios"}
                icon={ClipboardList}
                color={""}
            />
            <AppCard
                title={stats.concluidos.toString()}
                description={"Precatórios concluídos"}
                icon={Check}
                color={""}
            />
            <AppCard
                title={`R$ ${(stats.valorTotalCarteira / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description={"Valor Total da Carteira"}
                icon={TrendingUp}
                color={""}
            />
            <AppCard
                title={`R$ ${(stats.desembolsadoTotal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description={"Total Desembolsado"}
                icon={Wallet}
                color={""}
            />
        </div>
    )
}
