"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

const statusMessages: Record<string, string> = {
  thinking: "Analyzing your insights...",
  retrieving: "Syncing with the BuildClub brain...",
  assembling: "Crafting your next question...",
}

interface LoadingScannerProps {
  phase: "thinking" | "retrieving" | "assembling"
}

export function LoadingScanner({ phase }: LoadingScannerProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
      <div className="relative h-32 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-card-subtle border border-border/30 shadow-lg backdrop-blur-sm">
        {/* Main scanning beam - left to right movement */}
        <motion.div
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          animate={{ x: ["-5rem", "calc(100% + 1.25rem)"] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        />
        
        {/* Subtle shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer opacity-50" 
             style={{
               backgroundSize: '200% 100%',
               backgroundImage: 'linear-gradient(90deg, transparent, oklch(0.4 0.02 0 / 0.1), transparent)'
             }} />
        
        {/* Content overlay */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="animate-float"
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-8 w-8 text-primary/80" />
          </motion.div>
          <p className="text-sm font-medium text-muted-foreground px-4">{statusMessages[phase]}</p>
        </motion.div>
      </div>
      
      {/* Status indicator with soft pulsing */}
      <motion.div
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.span 
          className="h-1 w-1 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="animate-pulse-soft">Scanning context</span>
        <motion.span 
          className="h-1 w-1 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>
    </div>
  )
}

