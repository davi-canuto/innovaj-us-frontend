"use client"

import { useEffect, useState } from "react"
import { getDashboardData } from "@/lib/actions/dashboard"
import type { DashboardStats, ChartData } from "@/lib/actions/dashboard"
import { DashboardChart } from "@/components/layout/dashboard-chart"
import { DashboardPrecatoryTable } from "@/components/layout/dashboard-precatory-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CircleDollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  TrendingUp,
  DollarSign,
  Wallet,
  Handshake,
  CalendarClock,
} from "lucide-react"

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  sub,
  onClick,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconColor: string
  valueColor?: string
  sub?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
        <div className={`p-2 rounded-lg ${iconColor} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor ?? "text-[#1a384c]"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function CarteiraTotalModal({
  open,
  onClose,
  stats,
}: {
  open: boolean
  onClose: () => void
  stats: DashboardStats
}) {
  const currentYear = new Date().getFullYear()
  const anos = [0, 1, 2, 3].map((offset) => {
    const year = currentYear + offset
    const entry = stats.previsaoPorAno.find((p) => p.year === year)
    return { year, valorTotal: entry?.valor ?? 0 }
  })

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1a384c]">Relatório da Carteira por Ano</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Ano</th>
                <th className="text-right py-3 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Recebimento Previsto</th>
                <th className="text-right py-3 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Ganho Estimado</th>
                <th className="text-right py-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Ganho Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {anos.map(({ year, valorTotal }) => (
                <tr key={year} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-semibold text-[#1a384c]">{year}</td>
                  <td className="py-3 pr-4 text-right text-[#248A61] font-semibold">{formatCents(valorTotal)}</td>
                  <td className="py-3 pr-4 text-right text-emerald-600 font-semibold">{formatCents(stats.ganhoEstimado)}</td>
                  <td className="py-3 text-right text-indigo-600 font-semibold">{formatCents(stats.ganhoAtualizado)}</td>
                </tr>
              ))}
              <tr className="border-t-2 bg-gray-50">
                <td className="py-3 pr-4 font-bold text-[#1a384c]">Total</td>
                <td className="py-3 pr-4 text-right font-bold text-[#248A61]">{formatCents(anos.reduce((s, a) => s + a.valorTotal, 0))}</td>
                <td className="py-3 pr-4 text-right font-bold text-emerald-600">{formatCents(stats.ganhoEstimado)}</td>
                <td className="py-3 text-right font-bold text-indigo-600">{formatCents(stats.ganhoAtualizado)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<{ stats: DashboardStats; chart: ChartData; precatories: any[] } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getDashboardData().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  const { stats, chart, precatories } = data

  const recentes = [...precatories]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8)

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="bg-white border rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a384c]">Painel de Controle</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visão geral da carteira ·{" "}
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <CircleDollarSign className="h-10 w-10 text-[#248A61] opacity-60" strokeWidth={1.5} />
      </div>

      {/* Cards principais — linha 1: contagens */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total de Precatórios"
          value={stats.total.toString()}
          icon={CircleDollarSign}
          iconColor="text-[#248A61]"
        />
        <StatCard
          label="Total de RPVs"
          value={stats.totalRpvs.toString()}
          icon={Receipt}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <StatCard
          label="Em Negociação"
          value={stats.emNegociacao.toString()}
          icon={Clock}
          iconColor="text-yellow-500"
          valueColor="text-yellow-600"
        />
        <StatCard
          label="Negociados"
          value={stats.negociados.toString()}
          icon={Handshake}
          iconColor="text-indigo-500"
          valueColor="text-indigo-600"
        />
        <StatCard
          label="Concluídos"
          value={stats.concluidos.toString()}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
      </div>

      {/* Cards financeiros — linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Valor Total da Carteira"
          value={formatCents(stats.valorTotalCarteira)}
          icon={DollarSign}
          iconColor="text-[#248A61]"
          valueColor="text-[#248A61]"
          sub={`Clique para ver relatório por ano`}
          onClick={() => setModalOpen(true)}
        />
        <StatCard
          label="Valor Desembolsado"
          value={formatCents(stats.desembolsadoTotal)}
          icon={Wallet}
          iconColor="text-indigo-500"
          valueColor="text-indigo-600"
          sub={`${stats.totalNegociacoes} negociações`}
        />
        <StatCard
          label="Ganho Estimado"
          value={formatCents(stats.ganhoEstimado)}
          icon={TrendingUp}
          iconColor={stats.ganhoEstimado >= 0 ? "text-emerald-500" : "text-red-500"}
          valueColor={stats.ganhoEstimado >= 0 ? "text-emerald-600" : "text-red-600"}
          sub="Negociado − Desembolso"
        />
        <StatCard
          label="Ganho Atualizado"
          value={formatCents(stats.ganhoAtualizado)}
          icon={TrendingUp}
          iconColor={stats.ganhoAtualizado >= 0 ? "text-purple-500" : "text-red-500"}
          valueColor={stats.ganhoAtualizado >= 0 ? "text-purple-600" : "text-red-600"}
          sub="Valor Atual − Desembolso"
        />
      </div>

      {/* Cards de previsão por ano — linha 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((offset) => {
          const year = currentYear + offset
          const entry = stats.previsaoPorAno.find((p) => p.year === year)
          const valor = entry?.valor ?? 0
          return (
            <div key={year} className="bg-white border rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Recebimento {year}
                </span>
                <div className="p-2 rounded-lg text-sky-500 bg-opacity-10">
                  <CalendarClock className="h-4 w-4 text-sky-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-sky-600">{formatCents(valor)}</p>
              <p className="text-xs text-gray-400">{offset === 0 ? "Ano atual" : `Previsão +${offset} ano${offset > 1 ? "s" : ""}`}</p>
            </div>
          )
        })}
      </div>

      {/* Gráfico + Tabela recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DashboardChart
            emNegociacao={chart.emNegociacao}
            negociados={chart.negociados}
            concluidos={chart.concluidos}
            cancelados={chart.cancelados}
          />
        </div>
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-[#248A61]" />
            <h2 className="text-base font-semibold text-[#1a384c]">Atualizados Recentemente</h2>
          </div>
          <DashboardPrecatoryTable data={recentes} />
        </div>
      </div>

      {/* Barra de progresso por status */}
      {stats.total > 0 && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1a384c]">Distribuição por Status</h2>
          <div className="space-y-3">
            {[
              { label: "Em Negociação", count: stats.emNegociacao, color: "bg-yellow-400" },
              { label: "Negociados",    count: stats.negociados,   color: "bg-indigo-500" },
              { label: "Concluídos",    count: stats.concluidos,   color: "bg-emerald-500" },
              { label: "Cancelados",    count: stats.cancelados,   color: "bg-red-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-36 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#1a384c] w-16 text-right">
                  {count}{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    ({Math.round((count / stats.total) * 100)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal relatório */}
      <CarteiraTotalModal open={modalOpen} onClose={() => setModalOpen(false)} stats={stats} />
    </div>
  )
}
