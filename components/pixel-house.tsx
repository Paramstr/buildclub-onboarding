"use client"

import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getFilledPixels, pixelMapping } from "@/lib/coverage-utils"
import type { Coverage, Dimension } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PixelHouseProps {
  coverage: Coverage
  className?: string
}

const dimensionColors: Record<Dimension, string> = {
  role: "bg-blue-500",
  responsibilities: "bg-green-500",
  workflows: "bg-purple-500",
  tools: "bg-orange-500",
  inputs_outputs: "bg-teal-500",
  pain_points: "bg-red-500",
  metrics_kpis: "bg-yellow-500",
  compliance: "bg-pink-500",
  collaboration: "bg-indigo-500",
  ai_readiness: "bg-cyan-500",
}

const dimensionLabels: Record<Dimension, string> = {
  role: "Role",
  responsibilities: "Responsibilities",
  workflows: "Workflows",
  tools: "Tools",
  inputs_outputs: "Inputs/Outputs",
  pain_points: "Pain Points",
  metrics_kpis: "Metrics/KPIs",
  compliance: "Compliance",
  collaboration: "Collaboration",
  ai_readiness: "AI Readiness",
}

export function PixelHouse64({ coverage, className }: PixelHouseProps) {
  const filledPixels = getFilledPixels(coverage)

  // Create 8x8 grid (64 pixels)
  const pixels = Array.from({ length: 64 }, (_, index) => {
    const isFilled = filledPixels.has(index)

    // Find which dimension this pixel belongs to
    const dimension = Object.entries(pixelMapping).find(([_, pixels]) => pixels.includes(index))?.[0] as
      | Dimension
      | undefined

    return {
      index,
      isFilled,
      dimension,
      color: dimension ? dimensionColors[dimension] : "bg-muted",
    }
  })

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <h3 className="text-sm font-medium">Progress House</h3>
        <div className="grid grid-cols-8 gap-1 p-2 bg-muted/20 rounded-lg">
          {pixels.map((pixel) => (
            <Tooltip key={pixel.index}>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    "aspect-square rounded-sm transition-colors cursor-help",
                    pixel.isFilled ? pixel.color : "bg-muted/40",
                  )}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: pixel.isFilled ? 1 : 0.8,
                    opacity: pixel.isFilled ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3, delay: pixel.index * 0.01 }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {pixel.dimension ? dimensionLabels[pixel.dimension] : "Unassigned"}
                  {pixel.dimension && (
                    <span className="block text-muted-foreground">
                      {coverage[pixel.dimension]?.score || 0}% complete
                    </span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
