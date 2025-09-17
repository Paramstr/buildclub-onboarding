"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Zap, Shield } from "lucide-react"

interface OnboardingLandingProps {
  onBeginOnboarding: () => void
}

export function OnboardingLanding({ onBeginOnboarding }: OnboardingLandingProps) {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Questions",
      description: "Intelligent questions that adapt to your role and needs",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Role-Specific Setup",
      description: "Tailored for VC, Marketing, Sales, and Compliance professionals",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security",
    },
  ]

  const steps = ["Tell us about your role", "Share your workflows", "Set your preferences", "Start building"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Welcome to <span className="text-primary">BuildClub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Get personalized setup in minutes with our AI-driven onboarding. We'll ask the right questions to configure
            your perfect workspace.
          </p>
          <Button size="lg" onClick={onBeginOnboarding} className="text-lg px-8 py-6 group">
            Begin Your Setup Journey
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Steps */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {index + 1}
                </div>
                <h3 className="font-semibold mb-2">{step}</h3>
                <div className="w-8 h-1 bg-primary/20 mx-auto">
                  <div className="w-full h-full bg-primary rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Trusted by professionals at</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <Badge variant="outline">VC Firms</Badge>
            <Badge variant="outline">Marketing Teams</Badge>
            <Badge variant="outline">Sales Organizations</Badge>
            <Badge variant="outline">Compliance Departments</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
