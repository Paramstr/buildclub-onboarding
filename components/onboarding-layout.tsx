"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuickPicksRail } from "@/components/quick-picks-rail"
import { PixelHouse64 } from "@/components/pixel-house"
import { ProgressRingHUD } from "@/components/progress-ring"
import { TracksPanel } from "@/components/tracks-panel"
import { JsonInspector } from "@/components/json-inspector"
import { StatusBanner } from "@/components/status-banner"
import { QuestionRenderer } from "@/components/question-components"
import { Undo2, RotateCcw } from "lucide-react"
import type { OnboardingData, NextQuestion, QuickPick } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OnboardingLayoutProps {
  data: OnboardingData
  currentQuestion: NextQuestion | null
  status: "idle" | "thinking" | "retrieving" | "assembling"
  onAnswer: (value: any) => void
  onSkip: () => void
  onQuickPick: (pick: QuickPick) => void
  onUndo: () => void
  onReset: () => void
  onAcceptTrack: (trackId: string) => void
  onSwapTrack: (trackId: string) => void
  className?: string
}

export function OnboardingLayout({
  data,
  currentQuestion,
  status,
  onAnswer,
  onSkip,
  onQuickPick,
  onUndo,
  onReset,
  onAcceptTrack,
  onSwapTrack,
  className,
}: OnboardingLayoutProps) {
  const hasAnswers = data.answers.length > 0

  return (
    <div className={cn("min-h-screen bg-gradient-subtle", className)}>
      {/* Header */}
      <motion.header 
        className="border-b border-border/30 bg-gradient-card-subtle/80 backdrop-blur-md supports-[backdrop-filter]:bg-gradient-card-subtle/60"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="space-y-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-xl font-semibold text-foreground">BuildClub</h1>
              <p className="text-sm text-muted-foreground">Let's map your work—one quick step at a time.</p>
            </motion.div>

            <motion.div 
              className="flex items-center gap-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatusBanner status={status} />
              <div className="animate-float">
                <ProgressRingHUD progress={data.progressPercent} size={60} strokeWidth={4} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Three Pane Layout */}
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Left Rail - Quick Picks */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <QuickPicksRail onQuickPick={onQuickPick} />

            {/* Action Buttons */}
            {hasAnswers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="p-4 space-y-2 bg-gradient-card-subtle border-border/30 shadow-sm">
                  <Button variant="outline" size="sm" onClick={onUndo} className="w-full justify-start bg-transparent hover:bg-secondary/50 transition-all duration-200">
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo Last
                  </Button>
                  <Button variant="outline" size="sm" onClick={onReset} className="w-full justify-start bg-transparent hover:bg-secondary/50 transition-all duration-200">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Center - Question Stage */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center min-h-full space-y-6">
              {currentQuestion ? (
                <motion.div 
                  className="w-full max-w-2xl"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  key={currentQuestion.id}
                >
                  <QuestionRenderer question={currentQuestion} onAnswer={onAnswer} onSkip={onSkip} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-center space-y-4"
                >
                  <Card className="p-8 bg-gradient-card-subtle border-border/30 shadow-lg backdrop-blur-sm">
                    <div className="space-y-4">
                      <motion.h2 
                        className="text-lg font-medium text-foreground"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        Ready to get started?
                      </motion.h2>
                      <motion.p 
                        className="text-muted-foreground"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                      >
                        Use the Quick Picks on the left to get started, or we'll ask you a few questions to understand
                        your role and needs.
                      </motion.p>
                      {status === "idle" && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.0 }}
                        >
                          <Button 
                            onClick={() => onAnswer(null)} 
                            className="mt-4 bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-sm"
                          >
                            Begin Onboarding
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar - Progress & Data */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-secondary border-border/50">
                <TabsTrigger value="progress" className="data-[state=active]:bg-primary/10 transition-all duration-200">Progress</TabsTrigger>
                <TabsTrigger value="data" className="data-[state=active]:bg-primary/10 transition-all duration-200">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-6 mt-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <PixelHouse64 coverage={data.coverage} />
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <TracksPanel tracks={data.tracks} onAcceptTrack={onAcceptTrack} onSwapTrack={onSwapTrack} />
                </motion.div>
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <JsonInspector data={data} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
