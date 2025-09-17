import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { AiResponseSchema, type AiRequest, type AiResponse } from "@/lib/types"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000, // 30 seconds timeout
})

const SYSTEM_PROMPT = `You are BuildClub's intelligent onboarding assistant. Your goal is to create a personalized, progress-oriented experience that efficiently maps the user's work profile.

CORE PRINCIPLES:
- Ask ONE focused question at a time that maximizes information gain
- Follow a logical progression: Role → Responsibilities → Workflows → Tools → Pain Points → Goals
- Use the most appropriate UI component for each question type
- Build context from previous answers to ask smarter follow-up questions
- Prioritize high-impact dimensions that unlock the most value

QUESTION PROGRESSION STRATEGY:
1. ALWAYS START with open-ended text about role and seniority (e.g., "VP of Engineering at Meta", "Senior PM at fintech startup")
2. Follow up with context-driven questions based on their role (team size, reporting structure, specific workflows)
3. Understand key workflows and processes relevant to their seniority level
4. Identify tools and systems used at their level of responsibility
5. Uncover pain points and challenges specific to their role/seniority
6. Explore metrics, goals, and success criteria appropriate to their level
7. Address compliance and collaboration needs
8. Assess AI readiness and automation opportunities

UI COMPONENT SELECTION (prioritize visual engagement):
- short_text: ALWAYS START with role/seniority (extract company, level, domain from free text)
- chips: For follow-up context like team structure, company size, work style (4-8 focused options)
- checkbox_list: PREFERRED for workflows, tools, pain points, processes (use exactly 12 choices for perfect 3x4 grid)
- range: For satisfaction, frequency, confidence ratings (1-10 scale)
- toggle_pair: Rarely use - only for clear binary choices

INTELLIGENT FOLLOW-UP STRATEGY:
- Extract key info from role text: seniority level, company type, domain, team leadership
- Ask contextual follow-ups: "VP" → team size, "Engineering" → tech stack, "Startup" → stage/growth
- Use previous answers to narrow subsequent questions (if PM at tech company, focus on product workflows)

QUESTION DESIGN PRINCIPLES:
- Always provide exactly 12 pre-filled options for checkbox_list questions (perfect 3x4 grid)
- Include common pain points and workflows users can quickly recognize
- Make options scannable and relatable to their daily work
- Focus on speed - users should answer in 10-30 seconds per question

EXAMPLE WORKFLOW OPTIONS (exactly 12): "Sprint planning", "Bug triage", "Stakeholder reporting", "Content creation", "Email campaigns", "Social media management", "Performance tracking", "Team meetings", "Documentation", "Data analysis", "Project management", "Quality assurance"

EXAMPLE PAIN POINT OPTIONS (exactly 12): "Too many meetings", "Manual reporting", "Context switching", "Slow approvals", "Data quality issues", "Repetitive tasks", "Finding information", "Tool switching", "Communication delays", "Unclear priorities", "Technical limitations", "Resource constraints"

EXAMPLE TOOL OPTIONS (exactly 12): "Jira", "Linear", "Asana", "Notion", "Slack", "Microsoft Teams", "Google Workspace", "Salesforce", "HubSpot", "Figma", "GitHub", "Zapier"

CONTEXT AWARENESS:
- Reference previous answers to create continuity
- Ask clarifying questions when answers suggest complexity
- Avoid redundant questions about already-captured information
- Use industry-specific terminology when role is identified

COVERAGE OPTIMIZATION:
- Focus on dimensions with highest weight and lowest current scores
- Ensure each question targets 1-3 specific dimensions
- Update coverage scores based on information quality and completeness
- Maintain unknowns list to track what still needs exploration

Available dimensions: role, responsibilities, workflows, tools, inputs_outputs, pain_points, metrics_kpis, compliance, collaboration, ai_readiness`

// Fallback questions when AI fails
function getFallbackQuestion(answerCount: number): AiResponse {
  const fallbackQuestions = [
    {
      question: {
        id: "role_fallback",
        prompt: "Tell us about your role and seniority",
        context: "Help us understand your position and level of experience (e.g., 'VP of Engineering at Meta' or 'Senior Product Manager at a fintech startup')",
        ui: {
          kind: "short_text" as const,
          placeholder: "e.g., VP of Engineering at Meta, Senior PM at Stripe..."
        },
        targets: ["role" as const]
      },
      coverageUpdate: {
        role: { weight: 0.8, score: 60, unknowns: ["team_structure", "direct_reports"] }
      },
      tracks: [],
      rationale: "Starting with open-ended role and seniority to capture rich context about their position and experience level."
    },
    {
      question: {
        id: "team_structure_fallback", 
        prompt: "Tell us about your team structure and scope",
        context: "Understanding your leadership context helps us tailor recommendations to your level",
        ui: {
          kind: "chips" as const,
          options: ["Individual contributor", "Team lead (2-5 people)", "Manager (5-15 people)", "Director (15-50 people)", "VP/Head (50+ people)", "Cross-functional lead", "Consultant/Freelancer"]
        },
        targets: ["role" as const, "collaboration" as const]
      },
      coverageUpdate: {
        role: { weight: 0.8, score: 85, unknowns: ["direct_reports"] },
        collaboration: { weight: 0.6, score: 30, unknowns: ["meeting_frequency", "reporting_structure"] }
      },
      tracks: [],
      rationale: "Following up on role with team context to understand scope of responsibility and collaboration needs."
    },
    {
      question: {
        id: "tools_fallback",
        prompt: "What tools do you use most?", 
        context: "Knowing your tech stack helps us suggest integrations",
        ui: {
          kind: "checkbox_list" as const,
          options: ["Slack", "Jira", "Notion", "Google Workspace", "Figma", "GitHub", "Salesforce", "Linear", "Asana", "Microsoft Teams", "HubSpot", "Zapier"]
        },
        targets: ["tools" as const]
      },
      coverageUpdate: {
        tools: { weight: 0.6, score: 40, unknowns: ["integrations"] }
      },
      tracks: [],
      rationale: "Understanding your current tech stack for integration opportunities."
    }
  ]
  
  const questionIndex = Math.min(answerCount, fallbackQuestions.length - 1)
  return fallbackQuestions[questionIndex]
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called")

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY is not set")
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 })
    }

    console.log("[v0] Environment check passed - API key exists:", !!process.env.GROQ_API_KEY)
    console.log("[v0] Model setting:", process.env.GROQ_MODEL || "llama-3.1-70b-versatile")

    const body = await request.json()
    console.log("[v0] Request body structure:", Object.keys(body))
    console.log("[v0] Full request body:", JSON.stringify(body, null, 2))

    const aiRequest: AiRequest = {
      profile: body.profile || {},
      coverage: body.coverage || {},
      answers: body.answers || [],
    }

    console.log("[v0] Processed request - answers count:", aiRequest.answers?.length || 0)
    console.log("[v0] Coverage keys:", Object.keys(aiRequest.coverage || {}))
    console.log("[v0] Profile keys:", Object.keys(aiRequest.profile || {}))

    if (!aiRequest.coverage || typeof aiRequest.coverage !== "object") {
      console.error("[v0] Invalid coverage data:", aiRequest.coverage)
      return NextResponse.json({ error: "Invalid coverage data" }, { status: 400 })
    }

    if (!Array.isArray(aiRequest.answers)) {
      console.error("[v0] Invalid answers data:", aiRequest.answers)
      return NextResponse.json({ error: "Invalid answers data" }, { status: 400 })
    }

    const progressContext = {
      currentStep: aiRequest.answers.length + 1,
      totalAnswers: aiRequest.answers.length,
      progressPercent: Math.round(
        (Object.values(aiRequest.coverage).reduce((sum, dim) => sum + dim.score * dim.weight, 0) /
          Object.values(aiRequest.coverage).reduce((sum, dim) => sum + dim.weight, 0)) *
          100,
      ),
      highestScoreDimensions: Object.entries(aiRequest.coverage)
        .sort(([, a], [, b]) => b.score - a.score)
        .slice(0, 3)
        .map(([name]) => name),
      lowestScoreDimensions: Object.entries(aiRequest.coverage)
        .sort(([, a], [, b]) => a.score - b.score)
        .slice(0, 3)
        .map(([name]) => name),
    }

    const answerSummary =
      aiRequest.answers.length > 0
        ? aiRequest.answers.map((a, i) => `Q${i + 1}: ${a.value}`).join("; ")
        : "No previous answers"

    console.log("[v0] Calling OpenAI with context:", {
      step: progressContext.currentStep,
      progress: progressContext.progressPercent,
      answerCount: aiRequest.answers.length,
    })

    let completion
    try {
      console.log("[v0] About to call Groq API with model:", process.env.GROQ_MODEL || "llama-3.1-70b-versatile")
      console.log("[v0] Groq API Key length:", process.env.GROQ_API_KEY?.length || 0)
      console.log("[v0] API Key first 10 chars:", process.env.GROQ_API_KEY?.substring(0, 10))
      console.log("[v0] API Key last 10 chars:", process.env.GROQ_API_KEY?.substring(-10))
      console.log("[v0] API Key charCodes at end:", process.env.GROQ_API_KEY?.slice(-5).split('').map(c => c.charCodeAt(0)))
      
      completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `TECHNICAL DEMO CONTEXT:
This is a demonstration of intelligent, context-aware question generation.

CURRENT SESSION STATE:
- Step: ${progressContext.currentStep} (user has answered ${aiRequest.answers.length} questions)
- Overall Progress: ${progressContext.progressPercent}%
- Previous answers: ${answerSummary}

COVERAGE ANALYSIS:
- Strongest areas: ${progressContext.highestScoreDimensions.join(", ")} 
- Needs attention: ${progressContext.lowestScoreDimensions.join(", ")}
- Full coverage breakdown: ${JSON.stringify(aiRequest.coverage, null, 2)}

INTELLIGENT QUESTION GENERATION:
Generate the next question that demonstrates AI intelligence by:

1. **Context Awareness**: Reference previous answers to show continuity
2. **Strategic Targeting**: Focus on high-impact, low-coverage dimensions  
3. **Progressive Depth**: Ask deeper questions as we learn more about their role
4. **Efficiency**: Maximize information gain per question (aim for 6-8 total questions)
5. **Engagement**: Use the most appropriate UI component for fast, intuitive answers

CRITICAL REQUIREMENTS:
- Provide clear rationale explaining your reasoning for THIS question at THIS moment
- Show how it builds on what we already know
- Explain what new insights it will unlock
- Use context from previous answers to make questions more relevant
- Vary UI components to demonstrate different interaction patterns
- Keep total onboarding under 10 questions by being strategic

CRITICAL: Your response must be ONLY valid JSON. No markdown, no explanations, no code blocks.

Use this exact format:
{
  "question": {
    "id": "string (unique, descriptive)",
    "prompt": "string (conversational, ≤140 chars)",
    "context": "string (why this matters, builds on previous context)",
    "ui": {
      "kind": "chips|checkbox_list|toggle_pair|range|short_text",
      "options": ["array"] // EXACTLY 12 options for checkbox_list, 4-8 for chips
      "min": number, "max": number // for range (1-10 scale)
      "placeholder": "string" // for short_text
    },
    "targets": ["dimension_names"]
  },
  "coverageUpdate": {
    "dimension_name": {
      "weight": number,
      "score": number,
      "unknowns": ["strings"]
    }
  },
  "tracks": [{
    "id": "string",
    "title": "string", 
    "level": "Intro|Applied|Security|Manager",
    "modules": ["strings"],
    "rationale": "string",
    "etaHours": number
  }],
  "rationale": "string (2-3 sentences explaining: why this question now, how it builds on previous answers, what insights it unlocks)"
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })
      console.log("[v0] Groq call successful")
    } catch (groqError: any) {
      console.error("[v0] Groq API error:", {
        message: groqError.message,
        status: groqError.status,
        code: groqError.code,
        type: groqError.type,
        name: groqError.name,
        stack: groqError.stack,
        cause: groqError.cause,
      })
      console.error("[v0] Full error object:", groqError)

      if (groqError.status === 401) {
        return NextResponse.json({ error: "Invalid Groq API key" }, { status: 500 })
      } else if (groqError.status === 429) {
        return NextResponse.json({ error: "Groq rate limit exceeded" }, { status: 500 })
      } else if (groqError.status === 400) {
        return NextResponse.json({ error: "Invalid request to Groq" }, { status: 500 })
      }

      return NextResponse.json(
        {
          error: "Groq API error",
          details: groqError.message,
        },
        { status: 500 },
      )
    }

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      console.error("[v0] No response from Groq")
      throw new Error("No response from AI")
    }

    console.log("[v0] Groq response received, length:", responseText.length)

    // Parse and validate the response
    let aiResponse: AiResponse
    try {
      // Clean up markdown code blocks and formatting issues that Groq sometimes adds
      let cleanedResponse = responseText
        .replace(/```json\s*/gi, '') // Remove opening ```json (case insensitive)
        .replace(/```\s*$/g, '') // Remove closing ```
        .replace(/```/g, '') // Remove any remaining backticks
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .trim()

      // Try to extract JSON if there's still extra text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0]
      }

      console.log("[v0] Cleaned response:", cleanedResponse.substring(0, 200) + "...")
      
      let parsed
      try {
        parsed = JSON.parse(cleanedResponse)
      } catch (jsonError) {
        console.log("[v0] JSON parse failed, attempting fixes...")
        
        // Try to fix common JSON issues from Groq
        let fixedResponse = cleanedResponse
          .replace(/"weight":\s*title\s+(\d+(?:\.\d+)?)/g, '"weight": $1') // Fix "weight":title 0.0
          .replace(/"score":\s*title\s+(\d+(?:\.\d+)?)/g, '"score": $1') // Fix "score":title 0.0
          .replace(/:\s*title\s+(\d+(?:\.\d+)?)/g, ': $1') // Fix any other :title number patterns
          .replace(/:\s*([a-zA-Z]+)\s+(\d+(?:\.\d+)?)/g, ': $2') // Fix other malformed number fields
          .replace(/""([^"]+)""/g, '"$1"') // Fix double quotes
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas again
        
        console.log("[v0] Attempting to parse fixed response...")
        console.log("[v0] Fixed response length:", fixedResponse.length)
        console.log("[v0] Fixed response preview:", fixedResponse.substring(0, 200) + "...")
        console.log("[v0] Fixed response end:", "..." + fixedResponse.slice(-200))
        
        // Ensure we have a complete JSON object
        if (!fixedResponse.trim().endsWith('}')) {
          console.log("[v0] JSON appears incomplete, attempting reconstruction...")
          // Try to find the last complete object structure
          const braceCount = (fixedResponse.match(/\{/g) || []).length - (fixedResponse.match(/\}/g) || []).length
          if (braceCount > 0) {
            console.log("[v0] Missing", braceCount, "closing braces")
            // Add missing closing braces
            fixedResponse += '}'.repeat(braceCount)
          }
        }
        
        parsed = JSON.parse(fixedResponse)
      }
      
      aiResponse = AiResponseSchema.parse(parsed)
      console.log("[v0] Response validated successfully")
    } catch (parseError) {
      console.error("[v0] AI response validation failed:", parseError)
      console.error("[v0] Raw response preview:", responseText.substring(0, 500))
      
      // Try one more time with even more aggressive cleanup
      try {
        console.log("[v0] Attempting aggressive JSON recovery...")
        let aggressiveCleanup = responseText
          .replace(/```json\s*/gi, '')
          .replace(/```\s*$/g, '')
          .replace(/```/g, '')
          .replace(/^\s*[^{]*/, '') // Remove everything before first {
          .replace(/[^}]*$/, '}') // Remove everything after last } and add }
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/\\n/g, ' ') // Replace newlines
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        const aggressiveParsed = JSON.parse(aggressiveCleanup)
        aiResponse = AiResponseSchema.parse(aggressiveParsed)
        console.log("[v0] Aggressive recovery successful!")
      } catch (aggressiveError) {
        console.error("[v0] Aggressive recovery also failed:", aggressiveError)
        
        // Final fallback to a simple default question
        console.log("[v0] Using fallback question...")
        aiResponse = getFallbackQuestion(aiRequest.answers.length)
      }
    }

    console.log("[v0] Returning successful response")
    return NextResponse.json(aiResponse)
  } catch (error: any) {
    console.error("[v0] API error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      {
        error: "Failed to generate question",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
