"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Download, Check } from "lucide-react"
import type { OnboardingData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface JsonInspectorProps {
  data: OnboardingData
  className?: string
}

export function JsonInspector({ data, className }: JsonInspectorProps) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "onboarding-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Captured Data</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 bg-transparent">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload} className="h-8 bg-transparent">
            <Download className="h-3 w-3" />
            <span className="ml-1 text-xs">Download</span>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap break-words">
          <code>{jsonString}</code>
        </pre>
      </Card>
    </div>
  )
}
