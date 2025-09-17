"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { OnboardingData, NextQuestion, Answer, QuickPick } from "./types"
import { initialCoverage } from "./types"
import { calculateProgress, updateCoverage } from "./coverage-utils"
import { aiService } from "./ai-service"
import { storageService } from "./storage"

type Status = "idle" | "thinking" | "retrieving" | "assembling"

interface ProgressMilestone {
  step: number
  dimension: string
  score: number
  timestamp: string
}

interface OnboardingState {
  // Core state
  data: OnboardingData
  currentQuestion: NextQuestion | null
  currentQuestionRationale: string | null
  status: Status
  history: OnboardingData[]

  currentStep: number
  totalEstimatedSteps: number
  milestones: ProgressMilestone[]
  isComplete: boolean
  completionThreshold: number

  // Actions
  initialize: () => Promise<void>
  answerQuestion: (value: any) => Promise<void>
  skipQuestion: () => Promise<void>
  handleQuickPick: (pick: QuickPick) => Promise<void>
  undo: () => void
  reset: () => void
  acceptTrack: (trackId: string) => void
  swapTrack: (trackId: string) => void

  checkCompletion: () => void
  getProgressSummary: () => {
    currentStep: number
    totalSteps: number
    progressPercent: number
    isComplete: boolean
    nextMilestone?: string
  }

  // Internal methods
  setStatus: (status: Status) => void
  setCurrentQuestion: (question: NextQuestion | null) => void
  updateData: (updates: Partial<OnboardingData>) => void
  saveToHistory: () => void
  fetchNextQuestion: () => Promise<void>
}

const createInitialData = (): OnboardingData => ({
  profile: {},
  coverage: initialCoverage,
  answers: [],
  tracks: [],
  progressPercent: 0,
})

export const useOnboardingStore = create<OnboardingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    data: createInitialData(),
    currentQuestion: null,
    currentQuestionRationale: null,
    status: "idle",
    history: [],

    currentStep: 0,
    totalEstimatedSteps: 8,
    milestones: [],
    isComplete: false,
    completionThreshold: 80,

    // Initialize the store
    initialize: async () => {
      // Always start fresh from step 1 - clear any existing data
      storageService.clearData()
      
      const initialData = createInitialData()
      set({
        data: initialData,
        history: [initialData],
        currentStep: 0,
        isComplete: false,
        currentQuestion: null,
        currentQuestionRationale: null,
        status: "idle"
      })
      
      // Automatically fetch the first question
      await get().fetchNextQuestion()
    },

    checkCompletion: () => {
      const { data, completionThreshold } = get()
      const isComplete = data.progressPercent >= completionThreshold

      if (isComplete && !get().isComplete) {
        // First time reaching completion
        aiService.logProgressMilestone("completion_reached", {
          finalScore: data.progressPercent,
          totalAnswers: data.answers.length,
          topDimensions: Object.entries(data.coverage)
            .sort(([, a], [, b]) => b.score - a.score)
            .slice(0, 3)
            .map(([name, dim]) => ({ name, score: dim.score })),
        })
      }

      set({ isComplete })
    },

    getProgressSummary: () => {
      const { currentStep, totalEstimatedSteps, data, isComplete } = get()

      // Find next milestone dimension
      const nextMilestone = Object.entries(data.coverage)
        .filter(([, dim]) => dim.score < 70)
        .sort(([, a], [, b]) => b.weight - a.weight)[0]?.[0]

      return {
        currentStep,
        totalSteps: totalEstimatedSteps,
        progressPercent: data.progressPercent,
        isComplete,
        nextMilestone,
      }
    },

    // Set status
    setStatus: (status: Status) => {
      set({ status })
    },

    // Set current question
    setCurrentQuestion: (question: NextQuestion | null) => {
      set({ currentQuestion: question })
    },

    // Update data and recalculate progress
    updateData: (updates: Partial<OnboardingData>) => {
      const currentData = get().data
      const newData = { ...currentData, ...updates }

      // Recalculate progress
      newData.progressPercent = calculateProgress(newData.coverage)

      set({ data: newData })

      get().checkCompletion()

      // Auto-save to localStorage
      storageService.scheduleAutoSave(newData)
    },

    // Save current state to history
    saveToHistory: () => {
      const { data, history } = get()
      const newHistory = [...history, { ...data }]
      // Keep only last 10 states
      if (newHistory.length > 10) {
        newHistory.shift()
      }
      set({ history: newHistory })
    },

    // Fetch next question from AI
    fetchNextQuestion: async () => {
      const { data, setStatus, setCurrentQuestion, updateData } = get()

      try {
        setStatus("thinking")

        const aiRequest = {
          profile: data.profile,
          coverage: data.coverage,
          answers: data.answers,
        }

        setStatus("retrieving")
        const response = await aiService.getNextQuestion(aiRequest)

        setStatus("assembling")

        // Update coverage with AI response
        if (response.coverageUpdate) {
          const newCoverage = updateCoverage(data.coverage, response.coverageUpdate)
          updateData({
            coverage: newCoverage,
            tracks: response.tracks,
          })
        }

        // Set the new question and rationale
        setCurrentQuestion(response.question)
        set({ currentQuestionRationale: response.rationale || null })

        // Log telemetry
        aiService.logQuestionAsked(response.question.id, response.question.ui.kind)

        setStatus("idle")
      } catch (error) {
        console.error("Failed to fetch next question:", error)
        setStatus("idle")
        setCurrentQuestion(null)
      }
    },

    // Answer a question
    answerQuestion: async (value: any) => {
      const { data, currentQuestion, saveToHistory, updateData, fetchNextQuestion, milestones } = get()

      if (!currentQuestion) return

      // Save current state to history
      saveToHistory()

      // Create answer record
      const answer: Answer = {
        questionId: currentQuestion.id,
        value,
        capturedAt: new Date().toISOString(),
      }

      // Update data with new answer
      const newAnswers = [...data.answers, answer]
      updateData({ answers: newAnswers })

      const newStep = newAnswers.length
      set({ currentStep: newStep })

      // Log telemetry
      aiService.logAnswerCaptured(currentQuestion.id, typeof value, value)

      // Update coverage based on question targets
      const coverageUpdates: any = {}
      currentQuestion.targets.forEach((dimension) => {
        const current = data.coverage[dimension]
        if (current) {
          const scoreIncrease = Math.min(25, 100 - current.score)
          const newScore = Math.min(100, current.score + scoreIncrease)

          coverageUpdates[dimension] = {
            ...current,
            score: newScore,
            unknowns: current.unknowns.filter((u) => !String(value).toLowerCase().includes(u.toLowerCase())),
          }

          if (newScore >= 50 && current.score < 50) {
            const milestone: ProgressMilestone = {
              step: newStep,
              dimension,
              score: newScore,
              timestamp: new Date().toISOString(),
            }
            set({ milestones: [...milestones, milestone] })
            aiService.logProgressMilestone("dimension_milestone", { dimension, score: newScore })
          }
        }
      })

      if (Object.keys(coverageUpdates).length > 0) {
        const newCoverage = updateCoverage(data.coverage, coverageUpdates)
        updateData({ coverage: newCoverage })

        // Log coverage updates
        Object.entries(coverageUpdates).forEach(([dimension, update]: [string, any]) => {
          aiService.logCoverageUpdated(dimension, data.coverage[dimension]?.score || 0, update.score)
        })
      }

      aiService.logProgressMilestone("step_completed", {
        step: newStep,
        questionId: currentQuestion.id,
        targets: currentQuestion.targets,
      })

      // Fetch next question
      await fetchNextQuestion()
    },

    // Skip a question
    skipQuestion: async () => {
      const { currentStep } = get()
      set({ currentStep: currentStep + 1 })
      aiService.logProgressMilestone("step_skipped", { step: currentStep + 1 })
      await get().fetchNextQuestion()
    },

    // Handle quick pick selection
    handleQuickPick: async (pick: QuickPick) => {
      const { data, saveToHistory, updateData, fetchNextQuestion } = get()

      // Save current state to history
      saveToHistory()

      // Create answer record for quick pick
      const answer: Answer = {
        questionId: `quickpick-${pick.id}`,
        value: pick.value,
        capturedAt: new Date().toISOString(),
      }

      // Update data with new answer
      const newAnswers = [...data.answers, answer]
      updateData({ answers: newAnswers })

      set({ currentStep: newAnswers.length })

      // Update coverage based on quick pick targets
      const coverageUpdates: any = {}
      pick.targets.forEach((dimension) => {
        const current = data.coverage[dimension]
        if (current) {
          const scoreIncrease = 20 // Quick picks give 20 points
          coverageUpdates[dimension] = {
            ...current,
            score: Math.min(100, current.score + scoreIncrease),
          }
        }
      })

      if (Object.keys(coverageUpdates).length > 0) {
        const newCoverage = updateCoverage(data.coverage, coverageUpdates)
        updateData({ coverage: newCoverage })
      }

      // Log telemetry
      aiService.logAnswerCaptured(answer.questionId, "quickpick", pick.value)

      // Fetch next question
      await fetchNextQuestion()
    },

    // Undo last action
    undo: () => {
      const { history } = get()
      if (history.length > 1) {
        const previousState = history[history.length - 2]
        const newHistory = history.slice(0, -1)
        set({
          data: previousState,
          history: newHistory,
          currentQuestion: null,
          currentStep: previousState.answers.length, // Update step on undo
          isComplete: previousState.progressPercent >= get().completionThreshold,
        })
        aiService.logUndo("answer")
      }
    },

    // Reset to initial state
    reset: () => {
      const initialData = createInitialData()
      set({
        data: initialData,
        currentQuestion: null,
        status: "idle",
        history: [initialData],
        currentStep: 0, // Reset step counter
        milestones: [], // Clear milestones
        isComplete: false, // Reset completion
      })
      storageService.clearData()
    },

    // Accept a track
    acceptTrack: (trackId: string) => {
      const { data, updateData } = get()
      const track = data.tracks.find((t) => t.id === trackId)
      if (track) {
        // In a real app, this would navigate to the track or mark it as accepted
        aiService.logTrackAccepted(trackId)
        console.log("Accepted track:", track.title)
      }
    },

    // Swap/refresh a track
    swapTrack: (trackId: string) => {
      // In a real app, this would request alternative tracks
      console.log("Swapping track:", trackId)
    },
  })),
)

// Subscribe to data changes for auto-save
useOnboardingStore.subscribe(
  (state) => state.data,
  (data) => {
    storageService.scheduleAutoSave(data)
  },
)
