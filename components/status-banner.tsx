"use client"

import { motion } from "framer-motion"
import { Loader2, Brain, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusType = "thinking" | "retrieving" | "assembling" | "idle"

interface StatusBannerProps {
  status: StatusType
  className?: string
}

const statusConfig = {
  thinking: {
    icon: Brain,
    text: "Thinking",
    color: "text-blue-500",
  },
  retrieving: {
    icon: Loader2,
    text: "Retrieving",
    color: "text-orange-500",
  },
  assembling: {
    icon: Zap,
    text: "Assembling",
    color: "text-green-500",
  },
  idle: {
    icon: null,
    text: "",
    color: "",
  },
}

export function StatusBanner({ status, className }: StatusBannerProps) {
  const config = statusConfig[status]

  if (status === "idle" || !config.icon) {
    return null
  }

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-center gap-2 text-sm", config.color, className)}
    >
      <Icon className={cn("h-4 w-4", status === "retrieving" && "animate-spin")} />
      <span>{config.text}</span>
    </motion.div>
  )
}
