"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { quickPicksData, type QuickPick } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuickPicksRailProps {
  onQuickPick: (pick: QuickPick) => void
  className?: string
}

export function QuickPicksRail({ onQuickPick, className }: QuickPicksRailProps) {
  const categories = {
    workflows: quickPicksData.filter((p) => p.category === "workflows"),
    tools: quickPicksData.filter((p) => p.category === "tools"),
    compliance: quickPicksData.filter((p) => p.category === "compliance"),
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Picks</h3>
        <p className="text-xs text-muted-foreground">Tap to instantly capture common answers</p>
      </div>

      {Object.entries(categories).map(([category, picks]) => (
        <Card key={category} className="p-4 space-y-3">
          <h4 className="text-sm font-medium capitalize">{category}</h4>
          <div className="flex flex-wrap gap-2">
            {picks.map((pick) => (
              <motion.div key={pick.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => onQuickPick(pick)}
                >
                  {pick.label}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
