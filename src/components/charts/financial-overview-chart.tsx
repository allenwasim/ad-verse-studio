
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "../ui/chart"

type FinancialOverviewChartProps = {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
};

export function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  return (
    <ChartContainer config={{
        income: { label: "Income", color: "hsl(var(--chart-2))" },
        expense: { label: "Expense", color: "hsl(var(--chart-1))" },
    }} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: 'hsla(var(--muted)/0.2)' }}
        />
        <Legend />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
