import type { OnboardingData } from "./types"

const STORAGE_KEY = "buildclub-onboarding-data"

export class StorageService {
  private static instance: StorageService

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  saveData(data: OnboardingData): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  loadData(): OnboardingData | null {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          return JSON.parse(stored) as OnboardingData
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
    return null
  }

  clearData(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }

  // Auto-save functionality
  private autoSaveTimeout: NodeJS.Timeout | null = null

  scheduleAutoSave(data: OnboardingData, delay = 1000): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveData(data)
    }, delay)
  }
}

export const storageService = StorageService.getInstance()
