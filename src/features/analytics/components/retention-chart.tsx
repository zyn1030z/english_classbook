"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface RetentionData {
 mastered: number;
 learning: number;
 needsReview: number;
}

const COLORS = {
 mastered: "oklch(var(--chart-2))",
 learning: "oklch(var(--chart-1))",
 needsReview: "oklch(var(--chart-5))",
};

export function RetentionChart({ data }: { data: RetentionData }) {
 const total = data.mastered + data.learning + data.needsReview;

 const chartData = [
 { name: "Mastered", value: data.mastered, color: COLORS.mastered },
 { name: "Learning", value: data.learning, color: COLORS.learning },
 { name: "Needs review", value: data.needsReview, color: COLORS.needsReview },
 ].filter((d) => d.value > 0);

 if (total === 0) {
 return (
 <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
 No vocabulary data yet. Extract vocab from lessons to see retention.
 </div>
 );
 }

 return (
 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={chartData}
 dataKey="value"
 nameKey="name"
 innerRadius={56}
 outerRadius={92}
 paddingAngle={3}
 strokeWidth={0}
 >
 {chartData.map((entry) => (
 <Cell key={entry.name} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 formatter={(value: number) => [`${value} words (${Math.round((value / total) * 100)}%)`, undefined]}
 />
 <Legend
 verticalAlign="bottom"
 height={36}
 formatter={(value: string) => <span className="text-xs font-medium">{value}</span>}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
}
