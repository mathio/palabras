import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WordProgress {
  wordId: string
  streak: number
  nextReview: string // ISO date YYYY-MM-DD
  lastResult: 'pass' | 'fail' | null
}

const STORAGE_KEY = 'palabras-progress'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const useProgressStore = defineStore('progress', () => {
  const progressMap = ref<Record<string, WordProgress>>(load())

  function load(): Record<string, WordProgress> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap.value))
  }

  function getProgress(wordId: string): WordProgress {
    return progressMap.value[wordId] ?? {
      wordId,
      streak: 0,
      nextReview: today(),
      lastResult: null,
    }
  }

  function recordResult(
    wordId: string,
    result: 'pass' | 'fail',
    exposureFlag: 'know' | 'dont-know',
  ) {
    const current = getProgress(wordId)
    let streak: number
    let nextReview: string

    if (result === 'pass') {
      streak = current.streak + 1
      // 2^streak days: 2, 4, 8, 16... capped at 30
      const days = Math.min(Math.pow(2, streak), 30)
      nextReview = addDays(today(), days)
    } else {
      streak = 0
      // "don't know" + fail → resurface daily until first pass
      const days = exposureFlag === 'dont-know' ? 1 : 1
      nextReview = addDays(today(), days)
    }

    progressMap.value[wordId] = {
      wordId,
      streak,
      nextReview,
      lastResult: result,
    }
    save()
  }

  function isDue(wordId: string): boolean {
    const p = progressMap.value[wordId]
    if (!p) return false
    return p.nextReview <= today()
  }

  function isLearned(wordId: string): boolean {
    const p = progressMap.value[wordId]
    return !!p && p.streak >= 5
  }

  function isSeen(wordId: string): boolean {
    return !!progressMap.value[wordId]
  }

  return { progressMap, getProgress, recordResult, isDue, isLearned, isSeen }
})
