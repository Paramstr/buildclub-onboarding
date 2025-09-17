"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  status: "completed" | "current" | "upcoming"
}

interface ProgressBreadcrumbsProps {
  steps: Step[]
  className?: string
}

export function ProgressBreadcrumbs({ steps, className }: ProgressBreadcrumbsProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                step.status === "completed" && "bg-primary text-primary-foreground",
                step.status === "current" && "bg-primary/20 text-primary border-2 border-primary",
                step.status === "upcoming" && "bg-muted text-muted-foreground",
              )}
            >
              {step.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <span>{index + 1}</span>}
            </div>
            <Badge
              variant={step.status === "current" ? "default" : "outline"}
              className={cn(
                "text-xs",
                step.status === "completed" && "bg-primary/10 text-primary border-primary/20",
                step.status === "upcoming" && "text-muted-foreground",
              )}
            >
              {step.title}
            </Badge>
          </div>
          {index < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}
