"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  Calendar,
  BarChart3,
  Shield,
  Workflow,
  Settings,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Clock,
  FileText,
  Database,
  Palette,
  Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { NextQuestion } from "@/lib/types"

interface QuestionComponentProps {
  question: NextQuestion
  onAnswer: (value: any) => void
  onSkip: () => void
}

// Icon mapping for different workflow types
const workflowIcons: Record<string, React.ReactNode> = {
  "Sprint planning": <Calendar className="h-5 w-5" />,
  "Bug triage": <AlertTriangle className="h-5 w-5" />,
  "Stakeholder reporting": <BarChart3 className="h-5 w-5" />,
  "Weekly KPI roll-up": <TrendingUp className="h-5 w-5" />,
  "Content creation": <Palette className="h-5 w-5" />,
  "Email campaigns": <Mail className="h-5 w-5" />,
  "Social media management": <MessageSquare className="h-5 w-5" />,
  "Performance tracking": <Target className="h-5 w-5" />,
  "Team meetings": <Users className="h-5 w-5" />,
  "Documentation": <FileText className="h-5 w-5" />,
  "Data analysis": <Database className="h-5 w-5" />,
  "Project management": <Workflow className="h-5 w-5" />,
  "Quality assurance": <Shield className="h-5 w-5" />,
  "Client onboarding": <Users className="h-5 w-5" />,
  "Time tracking": <Clock className="h-5 w-5" />,
  "System configuration": <Settings className="h-5 w-5" />
}

const accentColors = [
  "accent-blue",
  "accent-green", 
  "accent-purple",
  "accent-orange",
  "accent-teal"
]

// Enhanced card-based selection for workflows and tools
export function QuestionCardGrid({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleCardClick = (option: string) => {
    if (isSubmitting) return
    
    const newSelected = selected.includes(option) 
      ? selected.filter((s) => s !== option) 
      : [...selected, option]
    setSelected(newSelected)
  }

  const handleContinue = () => {
    if (isSubmitting || selected.length === 0) return
    setIsSubmitting(true)
    onAnswer(selected)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-secondary rounded-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="h-4 w-4 accent-purple" />
          <span className="text-sm font-medium">Select all that apply</span>
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {question.ui.options?.map((option, index) => {
          const isSelected = selected.includes(option)
          const icon = workflowIcons[option] || <Workflow className="h-5 w-5" />
          const accentColor = accentColors[index % accentColors.length]
          
          return (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cn(
                  "card-selectable relative overflow-hidden",
                  isSelected && "card-selected"
                )}
                onClick={() => handleCardClick(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-lg bg-opacity-10 relative",
                      `bg-${accentColor.replace('accent-', '')}-100`,
                      accentColor
                    )}>
                      {icon}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border-2 border-primary"
                        >
                          <CheckCircle className="h-3 w-3 text-primary fill-primary" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium mb-1 text-sm leading-tight",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}>{option}</h3>
                      <p className={cn(
                        "text-xs line-clamp-2",
                        isSelected ? "text-primary-foreground opacity-80" : "text-muted-foreground"
                      )}>
                        {getWorkflowDescription(option)}
                      </p>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle className="h-4 w-4 accent-green" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="bg-gradient-card-subtle">
            {selected.length} selected
          </Badge>
          {selected.length > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-accent-green"
            >
              Looking good!
            </motion.span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
            Skip for now
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={selected.length === 0 || isSubmitting}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Visual rating scale for satisfaction/frequency questions
export function QuestionRatingScale({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [value, setValue] = useState<number[]>([5])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const min = question.ui.min || 1
  const max = question.ui.max || 10
  const labels = getRatingLabels(min, max)

  const handleContinue = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    onAnswer(value[0])
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <motion.div 
            className="text-6xl font-bold accent-blue"
            key={value[0]}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value[0]}
          </motion.div>
          <p className="text-lg text-muted-foreground">
            {labels[value[0] - min]}
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Slider
            value={value}
            onValueChange={setValue}
            max={max}
            min={min}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{labels[0]}</span>
            <span>{labels[labels.length - 1]}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={isSubmitting}
          className="bg-gradient-primary hover:opacity-90"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Quick visual chips for roles, tools, etc.
export function QuestionVisualChips({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMultiSelect = question.ui.options && question.ui.options.length > 6

  const handleChipClick = (option: string) => {
    if (isSubmitting) return

    if (isMultiSelect) {
      const newSelected = selected.includes(option) 
        ? selected.filter((s) => s !== option) 
        : [...selected, option]
      setSelected(newSelected)
    } else {
      setSelected([option])
      setIsSubmitting(true)
      setTimeout(() => onAnswer(option), 300)
    }
  }

  const handleContinue = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    onAnswer(isMultiSelect ? selected : selected[0])
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.05 }}
      >
        {question.ui.options?.map((option, index) => {
          const isSelected = selected.includes(option)
          const accentColor = accentColors[index % accentColors.length]
          
          return (
            <motion.div
              key={option}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleChipClick(option)}
                className={cn(
                  "relative px-3 py-2 h-auto text-sm font-medium transition-all w-full border-2",
                  isSelected 
                    ? "bg-gradient-primary text-primary-foreground border-primary shadow-lg transform scale-105"
                    : "bg-gradient-card-subtle hover:bg-gradient-card border-border hover:border-primary hover:shadow-md",
                  "transition-all duration-300"
                )}
              >
                {option}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <CheckCircle className="h-4 w-4 bg-background rounded-full accent-green" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          )
        })}
      </motion.div>

      {isMultiSelect && (
        <div className="flex justify-between items-center pt-4">
          <Badge variant="outline" className="bg-gradient-card-subtle">
            {selected.length} selected
          </Badge>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
              Skip
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={selected.length === 0 || isSubmitting}
              className="bg-gradient-primary hover:opacity-90"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced text input with better UX
export function QuestionEnhancedText({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = () => {
    if (isSubmitting || !value.trim()) return
    setIsSubmitting(true)
    onAnswer(value.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleContinue()
    }
  }

  return (
    <motion.div 
      className="space-y-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={question.ui.placeholder || "Type your answer..."}
            className="text-lg p-6 bg-gradient-card-subtle border-border focus:border-primary"
            autoFocus
          />
          <motion.div 
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-primary"
            initial={{ width: "0%" }}
            animate={{ width: value.length > 0 ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{value.length > 0 ? "Looking good!" : "Share your thoughts..."}</span>
          <span>{value.length}/500</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!value.trim() || isSubmitting}
          className="bg-gradient-primary hover:opacity-90"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

// Helper functions
function getWorkflowDescription(workflow: string): string {
  const descriptions: Record<string, string> = {
    "Sprint planning": "Plan and organize development cycles",
    "Bug triage": "Prioritize and assign issue resolution",
    "Stakeholder reporting": "Regular updates to key stakeholders",
    "Weekly KPI roll-up": "Track and report key metrics",
    "Content creation": "Develop marketing and educational materials",
    "Email campaigns": "Design and send targeted communications",
    "Social media management": "Plan and execute social content",
    "Performance tracking": "Monitor goals and outcomes",
    "Team meetings": "Regular sync and planning sessions",
    "Documentation": "Create and maintain process docs",
    "Data analysis": "Review metrics and insights",
    "Project management": "Coordinate tasks and timelines",
    "Quality assurance": "Ensure standards and compliance",
    "Client onboarding": "Welcome and setup new customers",
    "Time tracking": "Monitor productivity and billing",
    "System configuration": "Setup and maintain tools"
  }
  return descriptions[workflow] || "Part of your regular workflow"
}

function getRatingLabels(min: number, max: number): string[] {
  if (max <= 5) {
    return ["Poor", "Fair", "Good", "Very Good", "Excellent"]
  } else if (max <= 7) {
    return ["Very Low", "Low", "Below Average", "Average", "Above Average", "High", "Very High"]
  } else {
    return ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Almost Always", "Always"]
  }
}

// Enhanced Question Renderer with smart component selection
export function EnhancedQuestionRenderer({ question, onAnswer, onSkip }: QuestionComponentProps) {
  // Smart component selection based on question content and type
  const isWorkflowQuestion = question.prompt.toLowerCase().includes("workflow") || 
                           question.prompt.toLowerCase().includes("process") ||
                           question.targets.includes("workflows")
  
  const isToolQuestion = question.prompt.toLowerCase().includes("tool") ||
                        question.prompt.toLowerCase().includes("software") ||
                        question.targets.includes("tools")

  const isPainPointQuestion = question.prompt.toLowerCase().includes("pain") ||
                             question.prompt.toLowerCase().includes("frustrat") ||
                             question.prompt.toLowerCase().includes("slow") ||
                             question.targets.includes("pain_points")
  
  const isRatingQuestion = question.ui.kind === "range"
  
  const isTextQuestion = question.ui.kind === "short_text"
  
  const hasLotsOfOptions = question.ui.options && question.ui.options.length > 8
  const hasMediumOptions = question.ui.options && question.ui.options.length > 4 && question.ui.options.length <= 8

  // Choose the best component based on question characteristics
  if (isTextQuestion) {
    return <QuestionEnhancedText question={question} onAnswer={onAnswer} onSkip={onSkip} />
  } else if (isRatingQuestion) {
    return <QuestionRatingScale question={question} onAnswer={onAnswer} onSkip={onSkip} />
  } else if ((isWorkflowQuestion || isToolQuestion || isPainPointQuestion) && hasLotsOfOptions) {
    return <QuestionCardGrid question={question} onAnswer={onAnswer} onSkip={onSkip} />
  } else if (question.ui.kind === "checkbox_list" && hasMediumOptions) {
    return <QuestionCardGrid question={question} onAnswer={onAnswer} onSkip={onSkip} />
  } else {
    return <QuestionVisualChips question={question} onAnswer={onAnswer} onSkip={onSkip} />
  }
}
