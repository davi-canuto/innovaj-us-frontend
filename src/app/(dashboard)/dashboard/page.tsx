import { DashboardCards } from "@/components/layout/dashboard-cards";
import { DashboardPrecatoryTable } from "@/components/layout/dashboard-precatory-table";
import { List } from "lucide-react";
import { DashboardChart } from "@/components/layout/dashboard-chart";
import { getDashboardData } from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const { stats, chart, precatories } = await getDashboardData()

  return (
    <>
      <DashboardCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-6 bg-white">
          <section className="mx-auto lg:max-w-[90%]">
            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-semibold flex items-center space-x-2">
                <List strokeWidth={3} className="text-[#248A61]" />
                <h1 className="text-[#1a384c]">Precatórios</h1>
              </div>
            </div>
            <hr />
            <DashboardPrecatoryTable data={precatories} />
          </section>
        </div>
        <DashboardChart
          emAndamento={chart.emAndamento}
          finalizados={chart.finalizados}
          cancelados={chart.cancelados}
        />
      </div>
    </>
  );
}
