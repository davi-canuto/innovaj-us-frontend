"use client"

import * as React from "react"
import { ChartPie, TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  visitors: {
    label: "Precatórios",
  },
  emNegociacao: {
    label: "Em Negociação",
    color: "var(--chart-1)",
  },
  negociados: {
    label: "Negociados",
    color: "var(--chart-2)",
  },
  concluidos: {
    label: "Concluídos",
    color: "var(--chart-3)",
  },
  cancelados: {
    label: "Cancelados",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

interface DashboardChartProps {
  emNegociacao: number
  negociados: number
  concluidos: number
  cancelados: number
}

export function DashboardChart({ emNegociacao, negociados, concluidos, cancelados }: DashboardChartProps) {
  const chartData = [
    { browser: "emNegociacao", visitors: emNegociacao, fill: "#e2c438" },
    { browser: "negociados",   visitors: negociados,   fill: "#6366f1" },
    { browser: "concluidos",   visitors: concluidos,   fill: "#288f61" },
    { browser: "cancelados",   visitors: cancelados,   fill: "#e25438" },
  ]

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="flex flex-col border">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          <div className="text-xl font-semibold flex items-center space-x-2">
            <ChartPie strokeWidth={3} className="text-[#248A61]" />
            <h1 className="text-[#1a384c]">Precatórios por Status</h1>
          </div>
        </CardTitle>
        <CardDescription>Todos os precatórios cadastrados</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Precatórios
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#e2c438]" />Em Negociação</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6366f1]" />Negociados</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#288f61]" />Concluídos</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-[#e25438]" />Cancelados</span>
        </div>
        <div className="flex items-center gap-2 leading-none font-medium text-[#1a384c]">
          Distribuição por status <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Atualizado em tempo real</div>
      </CardFooter>
    </Card>
  )
}
