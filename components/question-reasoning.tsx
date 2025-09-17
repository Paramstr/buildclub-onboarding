"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  ArrowRight,
  Lightbulb,
  Zap
} from "lucide-react"
import type { NextQuestion } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuestionReasoningProps {
  question: NextQuestion
  rationale?: string
  step: number
  totalSteps: number
  previousContext?: string[]
}

export function QuestionReasoning({ 
  question, 
  rationale, 
  step, 
  totalSteps, 
  previousContext = [] 
}: QuestionReasoningProps) {
  // Extract key reasoning elements
  const reasoningParts = rationale ? parseRationale(rationale) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main Question Context */}
      <Card className="bg-gradient-card-subtle border-border/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent-blue/5 to-transparent" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 accent-purple" />
            Why This Question Now?
            <Badge variant="outline" className="ml-auto text-xs">
              Step {step}/{totalSteps}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {reasoningParts ? (
            <div className="space-y-3">
              {reasoningParts.context && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-accent-teal/10 mt-0.5">
                    <Target className="h-3 w-3 accent-teal" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Context</p>
                    <p className="text-sm text-foreground">{reasoningParts.context}</p>
                  </div>
                </motion.div>
              )}

              {reasoningParts.purpose && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-accent-blue/10 mt-0.5">
                    <Lightbulb className="h-3 w-3 accent-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Purpose</p>
                    <p className="text-sm text-foreground">{reasoningParts.purpose}</p>
                  </div>
                </motion.div>
              )}

              {reasoningParts.insights && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-accent-green/10 mt-0.5">
                    <TrendingUp className="h-3 w-3 accent-green" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insights</p>
                    <p className="text-sm text-foreground">{reasoningParts.insights}</p>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-accent-purple/10 mt-0.5">
                <Zap className="h-3 w-3 accent-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {getDefaultReasoning(question, step, previousContext)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Targets */}
      <Card className="bg-gradient-card-subtle border-border/30 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Target className="h-3 w-3" />
              Targeting Knowledge Areas
            </p>
            <div className="flex flex-wrap gap-1">
              {question.targets.map((target, idx) => (
                <motion.div
                  key={target}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-accent-blue/5 border-accent-blue/20 text-accent-blue"
                  >
                    {target.replace('_', ' ')}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Strategy */}
      <Card className="bg-gradient-card-subtle border-border/30 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              Interface Strategy
            </p>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-xs bg-accent-orange/5 border-accent-orange/20 text-accent-orange"
              >
                {question.ui.kind.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getUIReasoning(question.ui.kind)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Helper function to parse rationale into structured parts
function parseRationale(rationale: string): {
  context?: string
  purpose?: string
  insights?: string
} | null {
  try {
    // Simple parsing logic - could be enhanced with more sophisticated NLP
    const sections: any = {}
    
    if (rationale.toLowerCase().includes("context") || rationale.toLowerCase().includes("background")) {
      const contextMatch = rationale.match(/(context|background|situation)[:\s]+(.*?)(?=(purpose|goal|insight|because|\.|$))/i)
      if (contextMatch) sections.context = contextMatch[2].trim()
    }
    
    if (rationale.toLowerCase().includes("purpose") || rationale.toLowerCase().includes("goal")) {
      const purposeMatch = rationale.match(/(purpose|goal|aim)[:\s]+(.*?)(?=(insight|understand|context|\.|$))/i)
      if (purposeMatch) sections.purpose = purposeMatch[2].trim()
    }
    
    if (rationale.toLowerCase().includes("insight") || rationale.toLowerCase().includes("understand")) {
      const insightMatch = rationale.match(/(insight|understand|learn|discover)[:\s]+(.*?)$/i)
      if (insightMatch) sections.insights = insightMatch[2].trim()
    }
    
    // If no structured parsing worked, try to intelligently split
    if (Object.keys(sections).length === 0) {
      const sentences = rationale.split(/[.!?]+/).filter(s => s.trim().length > 10)
      if (sentences.length >= 2) {
        sections.context = sentences[0].trim()
        sections.purpose = sentences.slice(1).join('. ').trim()
      } else {
        sections.purpose = rationale.trim()
      }
    }
    
    return Object.keys(sections).length > 0 ? sections : null
  } catch {
    return null
  }
}

// Default reasoning when AI doesn't provide specific rationale
function getDefaultReasoning(question: NextQuestion, step: number, previousContext: string[]): string {
  const questionType = question.ui.kind
  const targets = question.targets
  
  if (step === 1) {
    return "Starting with role identification to understand your perspective and tailor the experience to your responsibilities."
  }
  
  if (targets.includes("workflows")) {
    return "Building on your role to understand the specific processes and workflows you manage daily."
  }
  
  if (targets.includes("pain_points")) {
    return "Identifying friction points and challenges to focus on solutions that will have the biggest impact."
  }
  
  if (targets.includes("tools")) {
    return "Understanding your current tech stack to suggest integrations and workflow improvements."
  }
  
  if (questionType === "range") {
    return "Gathering quantitative insights to better calibrate recommendations and track satisfaction levels."
  }
  
  return "Continuing to build a complete picture of your work context to provide personalized recommendations."
}

// UI component reasoning
function getUIReasoning(uiKind: string): string {
  switch (uiKind) {
    case "chips":
      return "Quick visual selection for categorical choices"
    case "checkbox_list":
      return "Multiple selection for comprehensive coverage"
    case "range":
      return "Slider for quantitative feedback and ratings"
    case "toggle_pair":
      return "Binary choice for clear preferences"
    case "short_text":
      return "Open input for specific details"
    default:
      return "Optimized for quick, intuitive responses"
  }
}
