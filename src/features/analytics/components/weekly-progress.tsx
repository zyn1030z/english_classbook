"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { weeklyProgress } from "@/lib/utils/demo-data";

export function WeeklyProgress() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyProgress}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "oklch(var(--muted))" }} />
          <Bar dataKey="vocabulary" fill="oklch(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="speaking" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
