import { getDashboardData } from "@/lib/actions/dashboard"
import { DashboardChart } from "@/components/layout/dashboard-chart"
import { DashboardPrecatoryTable } from "@/components/layout/dashboard-precatory-table"
import {
  CircleDollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  TrendingUp,
  DollarSign,
  Wallet,
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
}: {
  label: string
  value: string
  icon: React.ElementType
  iconColor: string
  valueColor?: string
  sub?: string
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col gap-3">
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

export default async function DashboardPage() {
  const { stats, chart, precatories } = await getDashboardData()

  const recentes = [...precatories]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="bg-white border rounded-2xl px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a384c]">Painel de Controle</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visão geral da carteira · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <CircleDollarSign className="h-10 w-10 text-[#248A61] opacity-60" strokeWidth={1.5} />
      </div>

      {/* Cards principais — linha 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Precatórios"
          value={stats.total.toString()}
          icon={CircleDollarSign}
          iconColor="text-[#248A61]"
        />
        <StatCard
          label="Em Andamento"
          value={stats.emAndamento.toString()}
          icon={Clock}
          iconColor="text-yellow-500"
          valueColor="text-yellow-600"
        />
        <StatCard
          label="Concluídos"
          value={stats.finalizados.toString()}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
        <StatCard
          label="Cancelados"
          value={stats.cancelados.toString()}
          icon={XCircle}
          iconColor="text-red-400"
          valueColor="text-red-500"
        />
      </div>

      {/* Cards financeiros — linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Valor Total da Carteira"
          value={formatCents(stats.valorTotal)}
          icon={DollarSign}
          iconColor="text-[#248A61]"
          valueColor="text-[#248A61]"
          sub="Soma dos valores requeridos"
        />
        <StatCard
          label="Valor Carteira Negociações"
          value={formatCents(stats.valorCarteiraNegociacoes)}
          icon={Wallet}
          iconColor="text-indigo-500"
          valueColor="text-indigo-600"
          sub={`${stats.totalNegociacoes} negociações`}
        />
        <StatCard
          label="Lucro Estimado"
          value={formatCents(stats.lucroEstimadoNegociacoes)}
          icon={TrendingUp}
          iconColor={stats.lucroEstimadoNegociacoes >= 0 ? "text-emerald-500" : "text-red-500"}
          valueColor={stats.lucroEstimadoNegociacoes >= 0 ? "text-emerald-600" : "text-red-600"}
          sub="Carteira de negociações"
        />
        <StatCard
          label="RPVs Cadastradas"
          value={stats.totalRpvs.toString()}
          icon={Receipt}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
          sub="Requisições de Pequeno Valor"
        />
      </div>

      {/* Gráfico + Tabela recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-1">
          <DashboardChart
            emAndamento={chart.emAndamento}
            finalizados={chart.finalizados}
            cancelados={chart.cancelados}
          />
        </div>

        {/* Tabela de recentes */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-[#248A61]" />
            <h2 className="text-base font-semibold text-[#1a384c]">Atualizados Recentemente</h2>
          </div>
          <DashboardPrecatoryTable data={recentes} />
        </div>
      </div>

      {/* Barra de progresso por estágio */}
      {stats.total > 0 && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1a384c]">Distribuição por Estágio</h2>
          <div className="space-y-3">
            {[
              { label: "Em Andamento", count: stats.emAndamento, color: "bg-yellow-400" },
              { label: "Concluídos",   count: stats.finalizados,  color: "bg-emerald-500" },
              { label: "Pendentes",    count: stats.pendentes,    color: "bg-gray-300" },
              { label: "Cancelados",   count: stats.cancelados,   color: "bg-red-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-32 shrink-0">{label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#1a384c] w-12 text-right">
                  {count} <span className="text-gray-400 font-normal text-xs">({Math.round((count / stats.total) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
