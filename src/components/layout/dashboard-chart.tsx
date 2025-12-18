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

export const description = "A donut chart with text"

const chartConfig = {
  visitors: {
    label: "Precatorios",
  },
  emAndamento: {
    label: "Em Andamento",
    color: "var(--chart-1)",
  },
  finalizados: {
    label: "Finalizados",
    color: "var(--chart-2)",
  },
  cancelados: {
    label: "cancelados",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface DashboardChartProps {
  emAndamento: number
  finalizados: number
  cancelados: number
}

export function DashboardChart({ emAndamento, finalizados, cancelados }: DashboardChartProps) {
  const chartData = [
    { browser: "emAndamento", visitors: emAndamento, fill: "#e2e238" },
    { browser: "finalizados", visitors: finalizados, fill: "#288f61" },
    { browser: "cancelados", visitors: cancelados, fill: "#e28238" },
  ]

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col border">
      <CardHeader className="items-center pb-0">
        <CardTitle> <div className="text-3xl font-semibold flex items-center space-x-2">
                <ChartPie strokeWidth={3} className=" text-[#248A61] " />
                <h1 className=" text-[#1a384c]"> Precatórios por estágios</h1>
              </div></CardTitle>
        <CardDescription>January - June 2024</CardDescription>
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
                          Visitors
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
        <div className="flex items-center gap-2 leading-none font-medium">
          +4 pra <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando todos os precatórios desde 2023
        </div>
      </CardFooter>
    </Card>
  )
}
