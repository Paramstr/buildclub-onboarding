import { z } from "zod"
import "./types" // Add missing class-variance-authority import for Badge component

// Core dimension types for coverage tracking
export type Dimension =
  | "role"
  | "responsibilities"
  | "workflows"
  | "tools"
  | "inputs_outputs"
  | "pain_points"
  | "metrics_kpis"
  | "compliance"
  | "collaboration"
  | "ai_readiness"

// UI component types that AI can choose from
export type UIKind = "chips" | "checkbox_list" | "toggle_pair" | "range" | "short_text"

// Coverage tracking for each dimension
export interface Coverage {
  [key: string]: {
    weight: number // importance (0-1)
    score: number // 0-100 coverage
    unknowns: string[] // what we still need to learn
  }
}

// Question structure from AI
export interface NextQuestion {
  id: string
  prompt: string // <= 140 chars user-facing text
  context?: string // optional supporting detail shown with the prompt
  ui: {
    kind: UIKind
    options?: string[] // for chips/checkbox_list
    min?: number // for range
    max?: number // for range
    placeholder?: string // for short_text
  }
  targets: Dimension[] // which coverage dimensions this updates
}

// User's answer to a question
export interface Answer {
  questionId: string
  value: any
  capturedAt: string
}

// Learning track recommendation
export interface Track {
  id: string
  title: string
  level: "Intro" | "Applied" | "Security" | "Manager"
  modules: string[] // list of module titles
  rationale: string // short description tying to captured data
  etaHours?: number
}

// Request to AI service
export interface AiRequest {
  profile: Record<string, any>
  coverage: Coverage
  answers: Answer[]
}

// Response from AI service
export interface AiResponse {
  question: NextQuestion
  coverageUpdate: Partial<Coverage>
  tracks: Track[]
  rationale?: string
}

// Complete onboarding data structure
export interface OnboardingData {
  profile: Record<string, any>
  coverage: Coverage
  answers: Answer[]
  tracks: Track[]
  progressPercent: number // weighted average of coverage scores
}

// Zod schemas for validation
export const NextQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().max(140),
  context: z.string().optional(),
  ui: z.object({
    kind: z.enum(["chips", "checkbox_list", "toggle_pair", "range", "short_text"]),
    options: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    placeholder: z.string().optional(),
  }),
  targets: z.array(
    z.enum([
      "role",
      "responsibilities",
      "workflows",
      "tools",
      "inputs_outputs",
      "pain_points",
      "metrics_kpis",
      "compliance",
      "collaboration",
      "ai_readiness",
    ]),
  ),
})

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.enum(["Intro", "Applied", "Security", "Manager"]),
  modules: z.array(z.string()),
  rationale: z.string(),
  etaHours: z.number().optional(),
})

export const AiResponseSchema = z.object({
  question: NextQuestionSchema,
  coverageUpdate: z.record(
    z
      .object({
        weight: z.number().min(0).max(1),
        score: z.number().min(0).max(100),
        unknowns: z.array(z.string()),
      })
      .partial(),
  ),
  tracks: z.array(TrackSchema),
  rationale: z.string().optional(),
})

// Initial coverage state
export const initialCoverage: Coverage = {
  role: { weight: 0.8, score: 0, unknowns: ["title", "seniority"] },
  responsibilities: { weight: 1.0, score: 0, unknowns: ["daily_tasks", "ownership"] },
  workflows: { weight: 1.0, score: 0, unknowns: ["processes", "cadence"] },
  tools: { weight: 0.6, score: 0, unknowns: ["primary_stack", "integrations"] },
  inputs_outputs: { weight: 0.7, score: 0, unknowns: ["data_sources", "deliverables"] },
  pain_points: { weight: 0.7, score: 0, unknowns: ["bottlenecks", "frustrations"] },
  metrics_kpis: { weight: 0.8, score: 0, unknowns: ["success_metrics", "targets"] },
  compliance: { weight: 0.9, score: 0, unknowns: ["regulations", "policies"] },
  collaboration: { weight: 0.6, score: 0, unknowns: ["handoffs", "stakeholders"] },
  ai_readiness: { weight: 0.6, score: 0, unknowns: ["current_usage", "policies"] },
}

// Quick picks data for left rail
export interface QuickPick {
  id: string
  label: string
  category: "workflows" | "tools" | "compliance"
  targets: Dimension[]
  value: string
}

export const quickPicksData: QuickPick[] = [
  // Workflows
  {
    id: "sprint-planning",
    label: "Sprint planning",
    category: "workflows",
    targets: ["workflows"],
    value: "Sprint planning",
  },
  { id: "bug-triage", label: "Bug triage", category: "workflows", targets: ["workflows"], value: "Bug triage" },
  {
    id: "stakeholder-report",
    label: "Stakeholder report",
    category: "workflows",
    targets: ["workflows", "collaboration"],
    value: "Stakeholder reporting",
  },
  {
    id: "weekly-kpi",
    label: "Weekly KPI roll-up",
    category: "workflows",
    targets: ["workflows", "metrics_kpis"],
    value: "Weekly KPI roll-up",
  },

  // Tools
  { id: "linear", label: "Linear", category: "tools", targets: ["tools"], value: "Linear" },
  { id: "jira", label: "Jira", category: "tools", targets: ["tools"], value: "Jira" },
  { id: "notion", label: "Notion", category: "tools", targets: ["tools"], value: "Notion" },
  { id: "salesforce", label: "Salesforce", category: "tools", targets: ["tools"], value: "Salesforce" },
  { id: "slack", label: "Slack", category: "tools", targets: ["tools", "collaboration"], value: "Slack" },

  // Compliance
  { id: "soc2", label: "SOC2", category: "compliance", targets: ["compliance"], value: "SOC2" },
  { id: "hipaa", label: "HIPAA", category: "compliance", targets: ["compliance"], value: "HIPAA" },
  { id: "gdpr", label: "GDPR", category: "compliance", targets: ["compliance"], value: "GDPR" },
  {
    id: "none-compliance",
    label: "None/Unsure",
    category: "compliance",
    targets: ["compliance"],
    value: "None/Unsure",
  },
]
