import type { AiRequest, AiResponse } from "./types"

export class AIService {
  private static instance: AIService
  private baseUrl: string
  private questionHistory: Array<{ question: string; answer: any; timestamp: number }> = []

  private constructor() {
    this.baseUrl = "/api"
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async getNextQuestion(request: AiRequest): Promise<AiResponse> {
    try {
      const enhancedRequest = {
        ...request,
        conversationContext: {
          questionCount: this.questionHistory.length,
          recentAnswers: this.questionHistory.slice(-3),
          sessionStartTime: this.questionHistory[0]?.timestamp || Date.now(),
        },
      }

      const response = await fetch(`${this.baseUrl}/next-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancedRequest),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as AiResponse
    } catch (error) {
      console.error("AI service error:", error)
      throw error
    }
  }

  recordQuestionAnswer(question: string, answer: any) {
    this.questionHistory.push({
      question,
      answer,
      timestamp: Date.now(),
    })

    if (this.questionHistory.length > 10) {
      this.questionHistory = this.questionHistory.slice(-10)
    }
  }

  logProgressMilestone(milestone: string, data?: Record<string, any>) {
    this.logEvent(`progress.${milestone}`, {
      ...data,
      questionCount: this.questionHistory.length,
      sessionDuration: this.getSessionDuration(),
    })
  }

  private getSessionDuration(): number {
    if (this.questionHistory.length === 0) return 0
    return Date.now() - this.questionHistory[0].timestamp
  }

  logEvent(event: string, data?: Record<string, any>) {
    console.log(`[Telemetry] ${event}:`, data)
  }

  logOnboardingView() {
    this.logEvent("onboarding.view")
  }

  logQuestionAsked(questionId: string, questionType: string) {
    this.logEvent("question.asked", { questionId, questionType })
  }

  logAnswerCaptured(questionId: string, answerType: string, value: any) {
    this.logEvent("answer.captured", { questionId, answerType, value })
    this.recordQuestionAnswer(questionId, value)
  }

  logCoverageUpdated(dimension: string, oldScore: number, newScore: number) {
    this.logEvent("coverage.updated", { dimension, oldScore, newScore })
  }

  logTracksUpdated(trackCount: number) {
    this.logEvent("tracks.updated", { trackCount })
  }

  logTrackAccepted(trackId: string) {
    this.logEvent("tracks.accepted", { trackId })
  }

  logUndo(actionType: string) {
    this.logEvent("undo", { actionType })
  }

  logSaveResume() {
    this.logEvent("save.resume")
  }
}

export const aiService = AIService.getInstance()
