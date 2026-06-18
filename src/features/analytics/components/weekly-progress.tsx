"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface WeeklyPoint {
  day: string;
  vocabulary: number;
  reviews: number;
}

export function WeeklyProgress({ data }: { data: WeeklyPoint[] }) {
  const hasData = data.some((d) => d.vocabulary > 0 || d.reviews > 0);

  if (!hasData) {
    return (
      <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
        No activity this week. Start learning to see your progress!
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "oklch(var(--muted))" }} />
          <Bar dataKey="vocabulary" name="Vocabulary" fill="oklch(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="reviews" name="Reviews" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
