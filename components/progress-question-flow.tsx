"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionRenderer } from "@/components/question-components"
import { PixelHouse64 } from "@/components/pixel-house"
import { ProgressNavigation } from "@/components/progress-navigation"
import { ProgressBreadcrumbs } from "@/components/progress-breadcrumbs"
import { ArrowRight, Sparkles, Trophy } from "lucide-react"
import { useOnboardingStore } from "@/lib/onboarding-store"
import { aiService } from "@/lib/ai-service"
import { LoadingScanner } from "@/components/loading-scanner"
import { ContextDisplay } from "@/components/context-display"
import { QuestionReasoning } from "@/components/question-reasoning"

export function ProgressQuestionFlow() {
  const {
    data,
    currentQuestion,
    currentQuestionRationale,
    status,
    currentStep,
    totalEstimatedSteps,
    isComplete,
    initialize,
    answerQuestion,
    skipQuestion,
    undo,
    reset,
    getProgressSummary,
  } = useOnboardingStore()

  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false)

  // Initialize the store on mount
  useEffect(() => {
    const initializeAsync = async () => {
      await initialize()
      aiService.logOnboardingView()
    }
    initializeAsync()
  }, [initialize])

  // Show breadcrumbs after first few steps
  useEffect(() => {
    setShowBreadcrumbs(currentStep >= 2)
  }, [currentStep])

  const handleAnswer = (value: any) => {
    answerQuestion(value)
  }

  const handleSkip = () => {
    skipQuestion()
  }

  const handlePrevious = () => {
    if (data.answers.length > 0) {
      undo()
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to start over? This will clear all your progress.")) {
      reset()
    }
  }

  const handleHome = () => {
    // In a real app, this would navigate to home
    console.log("Navigate to home")
  }

  const progressSummary = getProgressSummary()

  // Generate breadcrumb steps based on progress
  const breadcrumbSteps = [
    { id: "role", title: "Role", status: currentStep >= 1 ? "completed" : currentStep === 0 ? "current" : "upcoming" },
    {
      id: "responsibilities",
      title: "Responsibilities",
      status: currentStep >= 3 ? "completed" : currentStep >= 1 && currentStep < 3 ? "current" : "upcoming",
    },
    {
      id: "workflows",
      title: "Workflows",
      status: currentStep >= 5 ? "completed" : currentStep >= 3 && currentStep < 5 ? "current" : "upcoming",
    },
    {
      id: "tools",
      title: "Tools",
      status: currentStep >= 7 ? "completed" : currentStep >= 5 && currentStep < 7 ? "current" : "upcoming",
    },
    { id: "goals", title: "Goals", status: currentStep >= 8 ? "completed" : currentStep >= 7 ? "current" : "upcoming" },
  ] as const

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-2xl mx-auto px-4"
        >
          <div className="space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Trophy className="h-20 w-20 text-primary mx-auto" />
            </motion.div>
            <h1 className="text-4xl font-bold text-foreground">Congratulations!</h1>
            <p className="text-xl text-muted-foreground">
              Your BuildClub workspace is ready. We've gathered {data.answers.length} insights about your workflow.
            </p>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Coverage Map</h3>
              <PixelHouse64 coverage={data.coverage} />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{Math.round(data.progressPercent)}%</div>
                  <div className="text-muted-foreground">Profile Complete</div>
                </div>
                <div>
                  <div className="font-medium">{data.answers.length}</div>
                  <div className="text-muted-foreground">Questions Answered</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Enter BuildClub
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Progress Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">BuildClub Setup</h1>
                <p className="text-muted-foreground">
                  {progressSummary.nextMilestone ? `Next: ${progressSummary.nextMilestone}` : "Almost finished!"}
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Powered
              </Badge>
            </div>

            {showBreadcrumbs && <ProgressBreadcrumbs steps={breadcrumbSteps} />}
          </div>
        </div>
      </header>

      {/* Main Content - 3-Column Technical Demo Layout */}
      <main className="w-full px-6 py-8">
        {/* Navigation - Full Width */}
        <div className="max-w-[1600px] mx-auto mb-8">
          <ProgressNavigation
            currentStep={currentStep + 1}
            totalSteps={totalEstimatedSteps}
            progressPercent={data.progressPercent}
            canGoBack={data.answers.length > 0}
            canSkip={!!currentQuestion}
            isComplete={isComplete}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            onReset={handleReset}
            onHome={handleHome}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1800px] mx-auto">
          
          {/* Left Column - AI Reasoning */}
          <div className="xl:col-span-4">
            <div className="sticky top-8">
              {currentQuestion && (
                <QuestionReasoning
                  question={currentQuestion}
                  rationale={currentQuestionRationale || undefined}
                  step={currentStep + 1}
                  totalSteps={totalEstimatedSteps}
                  previousContext={data.answers.slice(-2).map(a => String(a.value))}
                />
              )}
            </div>
          </div>

          {/* Middle Column - Question Content */}
          <div className="xl:col-span-5">
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="relative p-6 shadow-lg bg-gradient-card border-border/50 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="w-fit text-xs">
                            Step {currentStep + 1} of {totalEstimatedSteps}
                          </Badge>
                          <Badge variant="outline" className="accent-blue text-xs">
                            {currentQuestion.ui.kind.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">{currentQuestion.prompt}</CardTitle>
                        {currentQuestion.context && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.context}</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <QuestionRenderer question={currentQuestion} onAnswer={handleAnswer} onSkip={handleSkip} />
                    </CardContent>
                    <AnimatePresence>
                      {status !== "idle" && (
                        <motion.div
                          key="loading-overlay"
                          className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <LoadingScanner phase={status === "thinking" ? "thinking" : status === "retrieving" ? "retrieving" : "assembling"} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <Card className="p-12 bg-gradient-card-subtle border-border/30 shadow-lg">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Setting up your profile...</h2>
                        <p className="text-xl text-muted-foreground">
                          We're preparing personalized questions for you.
                        </p>
                      </div>
                      <LoadingScanner phase={status === "thinking" ? "thinking" : status === "retrieving" ? "retrieving" : "assembling"} />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Context Collection Display */}
          <div className="xl:col-span-3">
            <div className="sticky top-8">
              <ContextDisplay
                data={data}
                currentQuestion={currentQuestion}
                questionRationale={currentQuestionRationale || undefined}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mini Progress Visualization */}
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="p-4 shadow-lg">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">Coverage Map</p>
            <PixelHouse64 coverage={data.coverage} size={80} />
            <div className="text-center">
              <div className="text-xs font-medium">{Math.round(data.progressPercent)}%</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
