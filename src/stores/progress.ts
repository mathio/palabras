import { defineStore } from 'pinia'
import { ref } from 'vue'
import { compressToBase64, decompressFromBase64 } from 'lz-string'

export interface WordProgress {
  wordId: string
  streak: number
  nextReview: string // ISO date YYYY-MM-DD
  lastResult: 'pass' | 'fail' | null
  easeFactor: number // SM-2, default 2.5
  interval: number   // SM-2, days between reviews
}

const STORAGE_KEY = 'palabras-progress'
const BATCHES_KEY = 'palabras-completed-batches'

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
  const completedBatches = ref<number>(loadBatches())

  function loadBatches(): number {
    try {
      return parseInt(localStorage.getItem(BATCHES_KEY) ?? '0', 10) || 0
    } catch {
      return 0
    }
  }

  function incrementCompletedBatches() {
    completedBatches.value++
    localStorage.setItem(BATCHES_KEY, String(completedBatches.value))
  }

  function load(): Record<string, WordProgress> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      const data = JSON.parse(raw) as Record<string, Partial<WordProgress> & { wordId: string; streak: number; nextReview: string }>
      const result: Record<string, WordProgress> = {}
      for (const [id, p] of Object.entries(data)) {
        result[id] = {
          wordId: p.wordId,
          streak: p.streak ?? 0,
          nextReview: p.nextReview ?? today(),
          lastResult: p.lastResult ?? null,
          easeFactor: p.easeFactor ?? 2.5,
          interval: p.interval ?? Math.min(Math.pow(2, p.streak ?? 0), 30),
        }
      }
      return result
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
      easeFactor: 2.5,
      interval: 0,
    }
  }

  function recordResult(
    wordId: string,
    result: 'pass' | 'fail',
    exposureFlag: 'know' | 'dont-know',
  ) {
    const cur = getProgress(wordId)
    // SM-2 quality: 4 = easy correct, 3 = hard correct, 1 = fail
    const quality = result === 'fail' ? 1 : exposureFlag === 'dont-know' ? 3 : 4

    let streak: number
    let easeFactor: number
    let interval: number

    if (quality >= 3) {
      streak = cur.streak + 1
      if (cur.streak === 0) {
        interval = 1
      } else if (cur.streak === 1) {
        interval = 6
      } else {
        interval = Math.round(cur.interval * cur.easeFactor)
      }
      interval = Math.min(interval, 90)
      easeFactor = cur.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
      easeFactor = Math.max(1.3, easeFactor)
    } else {
      streak = 0
      interval = 1
      easeFactor = cur.easeFactor
    }

    progressMap.value[wordId] = {
      wordId,
      streak,
      nextReview: addDays(today(), interval),
      lastResult: result,
      easeFactor,
      interval,
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

  function exportCode(): string {
    const data = { progress: progressMap.value, batches: completedBatches.value }
    return compressToBase64(JSON.stringify(data))
  }

  function importCode(code: string): boolean {
    try {
      const raw = decompressFromBase64(code.trim())
      if (!raw) return false
      const parsed = JSON.parse(raw)
      if (!parsed.progress || typeof parsed.progress !== 'object') return false
      const migrated: Record<string, WordProgress> = {}
      for (const [id, p] of Object.entries(parsed.progress as Record<string, Partial<WordProgress> & { wordId: string; streak: number; nextReview: string }>)) {
        migrated[id] = {
          wordId: p.wordId,
          streak: p.streak ?? 0,
          nextReview: p.nextReview ?? today(),
          lastResult: p.lastResult ?? null,
          easeFactor: p.easeFactor ?? 2.5,
          interval: p.interval ?? Math.min(Math.pow(2, p.streak ?? 0), 30),
        }
      }
      progressMap.value = migrated
      completedBatches.value = parsed.batches ?? 0
      save()
      localStorage.setItem(BATCHES_KEY, String(completedBatches.value))
      return true
    } catch {
      return false
    }
  }

  return { progressMap, completedBatches, getProgress, recordResult, isDue, isLearned, isSeen, incrementCompletedBatches, exportCode, importCode }
})
