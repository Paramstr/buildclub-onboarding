import type { Coverage, Dimension } from "./types"

// Calculate weighted progress percentage
export function calculateProgress(coverage: Coverage): number {
  const dimensions = Object.keys(coverage) as Dimension[]
  let totalWeightedScore = 0
  let totalWeight = 0

  dimensions.forEach((dim) => {
    const { weight, score } = coverage[dim]
    totalWeightedScore += weight * score
    totalWeight += weight
  })

  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
}

// Update coverage with new data
export function updateCoverage(currentCoverage: Coverage, updates: Partial<Coverage>): Coverage {
  const newCoverage = { ...currentCoverage }

  Object.entries(updates).forEach(([dimension, update]) => {
    if (newCoverage[dimension] && update) {
      newCoverage[dimension] = {
        ...newCoverage[dimension],
        ...update,
      }
    }
  })

  return newCoverage
}

// Get dimensions that need the most attention
export function getPriorityDimensions(coverage: Coverage, limit = 3): Dimension[] {
  const dimensions = Object.entries(coverage) as [Dimension, Coverage[string]][]

  return dimensions
    .sort((a, b) => {
      // Sort by weight * (100 - score) to prioritize high-weight, low-score dimensions
      const scoreA = a[1].weight * (100 - a[1].score)
      const scoreB = b[1].weight * (100 - b[1].score)
      return scoreB - scoreA
    })
    .slice(0, limit)
    .map(([dimension]) => dimension)
}

// Pixel house mapping - assign pixels to dimensions
export const pixelMapping: Record<Dimension, number[]> = {
  role: [0, 1, 8, 9],
  responsibilities: [2, 3, 10, 11],
  workflows: [4, 5, 12, 13],
  tools: [6, 7, 14, 15],
  inputs_outputs: [16, 17, 24, 25],
  pain_points: [18, 19, 26, 27],
  metrics_kpis: [20, 21, 28, 29],
  compliance: [22, 23, 30, 31],
  collaboration: [32, 33, 40, 41, 48, 49],
  ai_readiness: [34, 35, 42, 43, 50, 51],
}

// Get filled pixels based on coverage scores
export function getFilledPixels(coverage: Coverage): Set<number> {
  const filledPixels = new Set<number>()

  Object.entries(coverage).forEach(([dimension, data]) => {
    const pixels = pixelMapping[dimension as Dimension] || []
    const fillRatio = data.score / 100
    const pixelsToFill = Math.floor(pixels.length * fillRatio)

    for (let i = 0; i < pixelsToFill; i++) {
      filledPixels.add(pixels[i])
    }
  })

  return filledPixels
}
