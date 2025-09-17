"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NextQuestion } from "@/lib/types"
import { EnhancedQuestionRenderer } from "./enhanced-question-components"

interface QuestionComponentProps {
  question: NextQuestion
  onAnswer: (value: any) => void
  onSkip: () => void
}

export function QuestionChips({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMultiSelect = question.ui.options && question.ui.options.length > 3

  const handleChipClick = (option: string) => {
    if (isSubmitting) return

    if (isMultiSelect) {
      const newSelected = selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option]
      setSelected(newSelected)
    } else {
      setSelected([option])
      setIsSubmitting(true)
      // Auto-submit for single select with delay for visual feedback
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {question.ui.options?.map((option, index) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selected.includes(option) && "ring-2 ring-primary bg-primary/5",
                )}
                onClick={() => handleChipClick(option)}
              >
                <CardContent className="p-4 text-center relative">
                  <AnimatePresence>
                    {selected.includes(option) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-medium">{option}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {isMultiSelect && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-center">
          <Button onClick={handleContinue} disabled={selected.length === 0 || isSubmitting} size="lg" className="px-8">
            {isSubmitting ? (
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Continue {selected.length > 0 && `(${selected.length})`}
          </Button>
          <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
            Skip
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export function QuestionCheckboxList({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, option] : prev.filter((s) => s !== option)))
  }

  const handleContinue = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    onAnswer(selected)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {question.ui.options?.map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-sm",
                selected.includes(option) && "bg-primary/5 border-primary/20",
              )}
              onClick={() => handleCheckboxChange(option, !selected.includes(option))}
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                />
                <label htmlFor={option} className="text-sm font-medium leading-relaxed cursor-pointer flex-1">
                  {option}
                </label>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-center">
        <Button onClick={handleContinue} disabled={selected.length === 0 || isSubmitting} size="lg" className="px-8">
          {isSubmitting ? <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> : <ArrowRight className="h-4 w-4 mr-2" />}
          Continue {selected.length > 0 && `(${selected.length})`}
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip
        </Button>
      </motion.div>
    </div>
  )
}

export function QuestionTogglePair({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggle = (option: string) => {
    if (isSubmitting) return
    setSelected(option)
    setIsSubmitting(true)
    // Auto-submit after selection with visual feedback
    setTimeout(() => onAnswer(option), 300)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.ui.options?.slice(0, 2).map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg text-center",
                selected === option && "ring-2 ring-primary bg-primary/5",
              )}
              onClick={() => handleToggle(option)}
            >
              <CardContent className="p-0 relative">
                <AnimatePresence>
                  {selected === option && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0"
                    >
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-lg font-medium">{option}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isSubmitting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Processing your choice...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function QuestionRange({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [value, setValue] = useState<number[]>([50])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const min = question.ui.min ?? 0
  const max = question.ui.max ?? 100

  const handleContinue = () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    onAnswer(value[0])
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{value[0]}</div>
              <div className="text-sm text-muted-foreground">Current value</div>
            </div>
            <Slider value={value} onValueChange={setValue} min={min} max={max} step={1} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-center">
        <Button onClick={handleContinue} disabled={isSubmitting} size="lg" className="px-8">
          {isSubmitting ? <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> : <ArrowRight className="h-4 w-4 mr-2" />}
          Continue
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip
        </Button>
      </motion.div>
    </div>
  )
}

export function QuestionShortText({ question, onAnswer, onSkip }: QuestionComponentProps) {
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = () => {
    if (isSubmitting || !value.trim()) return
    setIsSubmitting(true)
    onAnswer(value.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim() && !isSubmitting) {
      handleContinue()
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Card className="p-6">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={question.ui.placeholder || "Type your answer..."}
            className="text-lg p-4 h-auto"
            autoFocus
          />
        </Card>
        <div className="text-center text-sm text-muted-foreground">Press Enter to continue</div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-center">
        <Button onClick={handleContinue} disabled={!value.trim() || isSubmitting} size="lg" className="px-8">
          {isSubmitting ? <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> : <ArrowRight className="h-4 w-4 mr-2" />}
          Continue
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
          Skip
        </Button>
      </motion.div>
    </div>
  )
}

export function QuestionRenderer({ question, onAnswer, onSkip }: QuestionComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <EnhancedQuestionRenderer question={question} onAnswer={onAnswer} onSkip={onSkip} />
    </motion.div>
  )
}
