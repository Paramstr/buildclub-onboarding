"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Workflow, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Eye
} from "lucide-react"
import type { OnboardingData, NextQuestion } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ContextDisplayProps {
  data: OnboardingData
  currentQuestion: NextQuestion | null
  questionRationale?: string
}

export function ContextDisplay({ data, currentQuestion, questionRationale }: ContextDisplayProps) {
  // Get the latest insights from answers
  const recentAnswers = data.answers.slice(-3)
  const roleAnswer = data.answers.find(a => a.questionId.includes("role") || a.questionId === "1")
  const workflowAnswers = data.answers.filter(a => 
    a.questionId.includes("workflow") || 
    a.questionId.includes("process") ||
    Array.isArray(a.value)
  )

  // Calculate dimension insights
  const dimensionInsights = Object.entries(data.coverage)
    .map(([name, dim]) => ({
      name,
      score: dim.score,
      weight: dim.weight,
      unknowns: dim.unknowns,
      priority: dim.weight * (100 - dim.score) // Higher = more important to ask about
    }))
    .sort((a, b) => b.priority - a.priority)

  const topInsights = dimensionInsights.slice(0, 3)
  const completedDimensions = dimensionInsights.filter(d => d.score >= 70)

  // Helper functions for better display
  const getQuestionTypeLabel = (answer: any) => {
    const question = answer.question || ''
    if (question.toLowerCase().includes('role')) return 'Role'
    if (question.toLowerCase().includes('workflow') || question.toLowerCase().includes('tasks')) return 'Workflows'
    if (question.toLowerCase().includes('tool')) return 'Tools'
    if (question.toLowerCase().includes('pain') || question.toLowerCase().includes('challenge')) return 'Pain Points'
    if (question.toLowerCase().includes('experience') || question.toLowerCase().includes('years')) return 'Experience'
    if (question.toLowerCase().includes('team') || question.toLowerCase().includes('size')) return 'Team'
    if (question.toLowerCase().includes('time') || question.toLowerCase().includes('hours')) return 'Time'
    return `Question ${data.answers.indexOf(answer) + 1}`
  }

  const formatAnswerValue = (value: any) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'No selections'
      if (value.length <= 2) return value.join(', ')
      return `${value.slice(0, 2).join(', ')} +${value.length - 2} more`
    }
    if (typeof value === 'string') {
      return value.length > 40 ? `${value.substring(0, 40)}...` : value
    }
    return String(value)
  }

  return (
    <div className="space-y-3">

      {/* Current Context Collected */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-card-subtle border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Eye className="h-4 w-4 accent-teal" />
              Context Collected
              <Badge variant="outline" className="ml-auto text-xs">{data.answers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {/* All Collected Information */}
            <div className="space-y-2">
              {data.answers.map((answer, idx) => {
                const isRecent = idx >= data.answers.length - 3
                const stepNumber = idx + 1
                
                return (
                  <motion.div
                    key={answer.questionId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={cn(
                      "rounded-lg p-2 border transition-all",
                      isRecent 
                        ? "bg-accent-blue/5 border-accent-blue/20" 
                        : "bg-muted/30 border-border/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                        isRecent 
                          ? "bg-accent-blue/20 text-accent-blue" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {getQuestionTypeLabel(answer)}
                          </p>
                          {isRecent && (
                            <Badge variant="outline" className="text-xs px-1 py-0 bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatAnswerValue(answer.value)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              
              {data.answers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs">No information collected yet</p>
                </div>
              )}
            </div>
            
            {/* Summary Stats */}
            {data.answers.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-accent-blue">{data.answers.length}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-accent-green">
                      {data.answers.filter(a => Array.isArray(a.value) ? a.value.length > 0 : a.value).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Answered</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-accent-purple">
                      {Math.round((data.answers.length / 8) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Knowledge Gaps & Priorities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-card-subtle border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Target className="h-4 w-4 accent-orange" />
              Knowledge Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {topInsights.map((insight, idx) => (
              <motion.div
                key={insight.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium capitalize text-foreground">
                    {insight.name.replace('_', ' ')}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs px-1.5 py-0.5",
                      insight.score === 0 ? "bg-accent-orange/10 text-accent-orange border-accent-orange/20" :
                      insight.score < 30 ? "bg-accent-orange/10 text-accent-orange border-accent-orange/20" :
                      insight.score < 70 ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20" :
                      "bg-accent-green/10 text-accent-green border-accent-green/20"
                    )}
                  >
                    {insight.score}%
                  </Badge>
                </div>
                <Progress value={insight.score} className="h-1.5" />
                {insight.unknowns.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Missing: {insight.unknowns.slice(0, 2).join(", ")}
                    {insight.unknowns.length > 2 && "..."}
                  </p>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-gradient-card-subtle border-border/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 accent-green" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="space-y-0.5">
                <p className="text-xl font-bold accent-blue">{Math.round(data.progressPercent)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold accent-green">{completedDimensions.length}</p>
                <p className="text-xs text-muted-foreground">Areas Done</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs font-medium flex items-center gap-2 text-foreground">
                <Lightbulb className="h-3.5 w-3.5 accent-purple" />
                Next Focus Areas
              </p>
              <div className="space-y-1">
                {topInsights.slice(0, 2).map((insight, idx) => (
                  <div key={insight.name} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent-orange" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {insight.name.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
