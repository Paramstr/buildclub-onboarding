import type { NextQuestion, AiResponse, Track } from "./types"

// Enhanced mock questions with better UX
export const mockQuestions: NextQuestion[] = [
  {
    id: "role-1",
    prompt: "Tell us about your role and seniority",
    context: "Help us understand your position and level of experience (e.g., 'VP of Engineering at Meta' or 'Senior Product Manager at a fintech startup')",
    ui: {
      kind: "short_text",
      placeholder: "e.g., VP of Engineering at Meta, Senior PM at Stripe, Director of Marketing at startup..."
    },
    targets: ["role", "responsibilities"],
  },
  {
    id: "team-context-1",
    prompt: "Tell us about your team structure",
    context: "Understanding your team helps us recommend the right collaboration and management tools",
    ui: {
      kind: "chips",
      options: [
        "Individual contributor", 
        "Team lead (2-5 people)", 
        "Manager (5-15 people)",
        "Director (15-50 people)", 
        "VP/Head (50+ people)",
        "Cross-functional lead",
        "Consultant/Freelancer"
      ],
    },
    targets: ["role", "collaboration"],
  },
  {
    id: "workflows-1", 
    prompt: "Which workflows and processes do you handle regularly?",
    context: "Select all that you do weekly or monthly - this helps us understand your workload",
    ui: {
      kind: "checkbox_list",
      options: [
        "Sprint planning",
        "Bug triage", 
        "Stakeholder reporting",
        "Content creation",
        "Email campaigns",
        "Social media management",
        "Performance tracking",
        "Team meetings",
        "Documentation",
        "Data analysis",
        "Project management",
        "Quality assurance"
      ],
    },
    targets: ["workflows", "responsibilities"],
  },
  {
    id: "pain-points-1",
    prompt: "What slows you down or frustrates you most in your daily work?",
    context: "Help us identify the biggest friction points we can help solve",
    ui: {
      kind: "checkbox_list", 
      options: [
        "Too many meetings",
        "Manual reporting", 
        "Context switching",
        "Slow approvals",
        "Data quality issues",
        "Repetitive tasks",
        "Finding information",
        "Tool switching",
        "Communication delays",
        "Unclear priorities",
        "Technical limitations",
        "Resource constraints"
      ],
    },
    targets: ["pain_points"],
  },
  {
    id: "tools-1",
    prompt: "Which tools do you use most frequently?",
    context: "This helps us understand your tech stack and potential integrations",
    ui: {
      kind: "checkbox_list",
      options: [
        "Jira", 
        "Linear", 
        "Asana", 
        "Notion", 
        "Slack",
        "Microsoft Teams",
        "Google Workspace",
        "Salesforce",
        "HubSpot",
        "Figma",
        "GitHub",
        "Zapier"
      ],
    },
    targets: ["tools"],
  },
  {
    id: "satisfaction-1",
    prompt: "How satisfied are you with your current workflow efficiency?",
    context: "Rate your overall satisfaction with how smoothly things run day-to-day",
    ui: {
      kind: "range",
      min: 1,
      max: 10,
    },
    targets: ["pain_points", "workflows"],
  },
]

// Mock tracks for demonstration
export const mockTracks: Track[] = [
  {
    id: "pm-essentials",
    title: "AI-Powered Product Management",
    level: "Applied",
    modules: ["User Story Generation", "Competitive Analysis", "Roadmap Planning"],
    rationale: "Based on your PM role and workflow needs",
    etaHours: 8,
  },
  {
    id: "data-analysis",
    title: "AI Data Analysis Workflows",
    level: "Applied",
    modules: ["Query Generation", "Report Automation", "Insight Discovery"],
    rationale: "Addresses your data quality pain points",
    etaHours: 6,
  },
]

// Mock AI response generator
export function generateMockResponse(questionIndex: number): AiResponse {
  const question = mockQuestions[questionIndex % mockQuestions.length]

  return {
    question,
    coverageUpdate: {
      [question.targets[0]]: {
        weight: 0.8,
        score: Math.min(100, (questionIndex + 1) * 20),
        unknowns: [],
      },
    },
    tracks: mockTracks.slice(0, Math.min(3, questionIndex + 1)),
  }
}
