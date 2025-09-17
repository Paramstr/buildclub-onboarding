"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, ArrowRight } from "lucide-react"
import type { Track } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TracksPanelProps {
  tracks: Track[]
  onAcceptTrack?: (trackId: string) => void
  onSwapTrack?: (trackId: string) => void
  className?: string
}

const levelColors = {
  Intro: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Manager: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export function TracksPanel({ tracks, onAcceptTrack, onSwapTrack, className }: TracksPanelProps) {
  if (tracks.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-sm font-medium">Recommended Tracks</h3>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Answer a few questions to see personalized learning tracks
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recommended Tracks</h3>
        <Badge variant="secondary" className="text-xs">
          {tracks.length} tracks
        </Badge>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium leading-tight">{track.title}</h4>
                  <Badge className={cn("text-xs", levelColors[track.level])} variant="secondary">
                    {track.level}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{track.rationale}</p>

                {track.etaHours && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{track.etaHours}h estimated</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {track.modules.slice(0, 3).map((module) => (
                    <Badge key={module} variant="outline" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                  {track.modules.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{track.modules.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => onAcceptTrack?.(track.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-transparent"
                    onClick={() => onSwapTrack?.(track.id)}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
