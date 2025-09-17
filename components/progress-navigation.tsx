"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RotateCcw, Home, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressNavigationProps {
  currentStep: number
  totalSteps: number
  progressPercent: number
  canGoBack: boolean
  canSkip: boolean
  isComplete: boolean
  onPrevious: () => void
  onSkip: () => void
  onReset: () => void
  onHome: () => void
  className?: string
}

export function ProgressNavigation({
  currentStep,
  totalSteps,
  progressPercent,
  canGoBack,
  canSkip,
  isComplete,
  onPrevious,
  onSkip,
  onReset,
  onHome,
  className,
}: ProgressNavigationProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Step {currentStep} of {totalSteps}
                </span>
                {isComplete && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isComplete ? "Setup finished!" : "Building your profile..."}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{Math.round(progressPercent)}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!canGoBack}
            className={cn("flex items-center gap-2", !canGoBack && "opacity-50 cursor-not-allowed")}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          {canSkip && !isComplete && (
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              Skip Question
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <RotateCcw className="h-4 w-4 mr-1" />
            Start Over
          </Button>
          <Button variant="ghost" size="sm" onClick={onHome}>
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}
