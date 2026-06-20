import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
 "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
 {
 variants: {
 variant: {
 default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
 secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
 destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
 outline: "text-foreground",
 muted: "border-transparent bg-muted text-muted-foreground"
 },
 tone: {
 blue: "border-transparent bg-primary/10 text-primary",
 green: "border-transparent bg-chart-2/15 text-chart-2",
 amber: "border-transparent bg-chart-5/15 text-chart-5",
 red: "border-transparent bg-destructive/10 text-destructive",
 neutral: "border-transparent bg-muted text-muted-foreground"
 }
 },
 defaultVariants: {
 variant: "muted"
 }
 }
);

export function Badge({
 className,
 variant,
 tone,
 ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
 return <div className={cn(badgeVariants({ variant, tone, className }))} {...props} />;
}

export { badgeVariants };
