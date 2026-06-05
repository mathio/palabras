import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { useLanguageStore } from './language'

export interface WordProgress {
  wordId: string
  streak: number
  nextReview: string // ISO date YYYY-MM-DD
  lastResult: 'pass' | 'fail' | null
  easeFactor: number // SM-2, default 2.5
  interval: number   // SM-2, days between reviews
}

function progressKey(pairId: string) { return `palabras-progress-${pairId}` }
function batchesKey(pairId: string) { return `palabras-completed-batches-${pairId}` }

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function migrateStorage() {
  const old = localStorage.getItem('palabras-progress')
  if (old && !localStorage.getItem('palabras-progress-es-en')) {
    localStorage.setItem('palabras-progress-es-en', old)
    localStorage.removeItem('palabras-progress')
  }
  const oldBatches = localStorage.getItem('palabras-completed-batches')
  if (oldBatches && !localStorage.getItem('palabras-completed-batches-es-en')) {
    localStorage.setItem('palabras-completed-batches-es-en', oldBatches)
    localStorage.removeItem('palabras-completed-batches')
  }
  localStorage.removeItem('palabras-session')
}

function loadBatchesFor(pairId: string): number {
  try {
    return parseInt(localStorage.getItem(batchesKey(pairId)) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function loadProgressFor(pairId: string): Record<string, WordProgress> {
  try {
    const raw = localStorage.getItem(progressKey(pairId))
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

migrateStorage()

export const useProgressStore = defineStore('progress', () => {
  const lang = useLanguageStore()

  const progressMap = ref<Record<string, WordProgress>>(loadProgressFor(lang.activePairId))
  const completedBatches = ref<number>(loadBatchesFor(lang.activePairId))

  watch(() => lang.activePairId, (newId) => {
    progressMap.value = loadProgressFor(newId)
    completedBatches.value = loadBatchesFor(newId)
  })

  function completedBatchesForPair(pairId: string): number {
    return loadBatchesFor(pairId)
  }

  function incrementCompletedBatches() {
    completedBatches.value++
    localStorage.setItem(batchesKey(lang.activePairId), String(completedBatches.value))
  }

  function save() {
    localStorage.setItem(progressKey(lang.activePairId), JSON.stringify(progressMap.value))
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
      localStorage.setItem(batchesKey(lang.activePairId), String(completedBatches.value))
      return true
    } catch {
      return false
    }
  }

  return { progressMap, completedBatches, completedBatchesForPair, getProgress, recordResult, isDue, isLearned, isSeen, incrementCompletedBatches, exportCode, importCode }
})
