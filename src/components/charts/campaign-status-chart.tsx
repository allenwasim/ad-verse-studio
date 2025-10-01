"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

type CampaignStatusChartProps = {
    data: {
        name: string;
        value: number;
        fill: string;
    }[];
};


export function CampaignStatusChart({ data }: CampaignStatusChartProps) {
  return (
    <ChartContainer
      config={{
        active: { label: "Active", color: "hsl(var(--chart-1))" },
        upcoming: { label: "Upcoming", color: "hsl(var(--chart-4))" },
        completed: { label: "Completed", color: "hsl(var(--chart-5))" },
      }}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={2}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}
