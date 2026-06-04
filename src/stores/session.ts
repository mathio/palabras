import { defineStore } from 'pinia'
import { ref } from 'vue'
import { words } from '../data/words'
import { useProgressStore } from './progress'

export interface SessionWord {
  wordId: string
  exposureFlag: 'know' | 'dont-know' | null
  quizResult: 'pass' | 'fail' | null
  quizDirection: 'es-en' | 'en-es'
  quizMode: 'word' | 'contextual'
  quizInputMode: 'choice' | 'type'
}

const BATCH_SIZE = 15
const MIN_NEW_RATIO = 0.5
const STORAGE_KEY = 'palabras-session'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Words where fill-in-blank is semantically ambiguous (any option fits the sentence)
function isContextualSafe(wordId: string): boolean {
  return !wordId.startsWith('num-')
}

export const useSessionStore = defineStore('session', () => {
  const date = ref<string>('')
  const batch = ref<SessionWord[]>([])
  const exposureIndex = ref(0)
  const quizIndex = ref(0)
  const quizOrder = ref<number[]>([])
  const phase = ref<'exposure' | 'quiz' | 'results' | 'idle'>('idle')

  function buildBatch(): SessionWord[] {
    const progress = useProgressStore()
    const due = words
      .filter(w => progress.isSeen(w.id) && !progress.isLearned(w.id) && progress.isDue(w.id))
      .sort((a, b) => progress.getProgress(a.id).streak - progress.getProgress(b.id).streak)

    const levelOrder = { A0: 0, A1: 1, A2: 2 }
    const newWords = words
      .filter(w => !progress.isSeen(w.id))
      .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])

    const minNew = Math.ceil(BATCH_SIZE * MIN_NEW_RATIO)
    const selectedDue = due.slice(0, BATCH_SIZE - minNew)
    const combined = [...selectedDue, ...newWords.slice(0, BATCH_SIZE - selectedDue.length)]

    if (combined.length < BATCH_SIZE) {
      const selectedIds = new Set(combined.map(w => w.id))
      const upcoming = words
        .filter(w => !progress.isLearned(w.id) && !selectedIds.has(w.id))
        .sort((a, b) => {
          const pa = progress.getProgress(a.id).nextReview ?? ''
          const pb = progress.getProgress(b.id).nextReview ?? ''
          return pa.localeCompare(pb)
        })
      combined.push(...upcoming.slice(0, BATCH_SIZE - combined.length))
    }

    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[combined[i], combined[j]] = [combined[j], combined[i]]
    }

    return combined.map(w => {
      const streak = progress.getProgress(w.id).streak
      const contextual = streak >= 1 && isContextualSafe(w.id) && Math.random() < 0.7
      return {
        wordId: w.id,
        exposureFlag: null,
        quizResult: null,
        quizDirection: (Math.random() < 0.5 ? 'es-en' : 'en-es') as 'es-en' | 'en-es',
        quizMode: (contextual ? 'contextual' : 'word') as 'word' | 'contextual',
        quizInputMode: (streak >= 2 ? 'type' : 'choice') as 'choice' | 'type',
      }
    })
  }

  function startSession() {
    const saved = loadSaved()
    if (saved && saved.date === today() && !isComplete(saved)) {
      date.value = saved.date
      batch.value = saved.batch
      exposureIndex.value = saved.exposureIndex
      quizIndex.value = saved.quizIndex
      quizOrder.value = saved.quizOrder ?? Array.from({ length: saved.batch.length }, (_, i) => i)
      phase.value = saved.phase
    } else {
      date.value = today()
      batch.value = buildBatch()
      exposureIndex.value = 0
      quizIndex.value = 0
      quizOrder.value = []
      phase.value = 'exposure'
      persist()
    }
  }

  function recordExposure(wordId: string, flag: 'know' | 'dont-know') {
    const item = batch.value.find(b => b.wordId === wordId)
    if (item) item.exposureFlag = flag
    exposureIndex.value++
    if (exposureIndex.value >= batch.value.length) {
      phase.value = 'quiz'
      quizIndex.value = 0
      quizOrder.value = shuffleIndices(batch.value.length)
    }
    persist()
  }

  function recordQuiz(wordId: string, result: 'pass' | 'fail') {
    const item = batch.value.find(b => b.wordId === wordId)
    if (item) item.quizResult = result
    quizIndex.value++
    if (quizIndex.value >= batch.value.length) {
      phase.value = 'results'
      commitToProgress()
    }
    persist()
  }

  function commitToProgress() {
    const progress = useProgressStore()
    for (const item of batch.value) {
      if (item.quizResult && item.exposureFlag) {
        progress.recordResult(item.wordId, item.quizResult, item.exposureFlag)
      }
    }
    progress.incrementCompletedBatches()
  }

  function currentExposureWord() {
    return batch.value[exposureIndex.value] ?? null
  }

  function currentQuizWord() {
    const idx = quizOrder.value[quizIndex.value] ?? quizIndex.value
    return batch.value[idx] ?? null
  }

  function failedWords() {
    return batch.value.filter(b => b.quizResult === 'fail')
  }

  function undoExposure() {
    if (exposureIndex.value <= 0) return
    exposureIndex.value--
    const item = batch.value[exposureIndex.value]
    if (item) item.exposureFlag = null
    phase.value = 'exposure'
    persist()
  }

  interface SavedSession {
    date: string
    batch: SessionWord[]
    exposureIndex: number
    quizIndex: number
    quizOrder: number[]
    phase: 'exposure' | 'quiz' | 'results' | 'idle'
  }

  function isComplete(s: SavedSession): boolean {
    return s.phase === 'results'
  }

  function loadSaved(): SavedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: date.value,
      batch: batch.value,
      exposureIndex: exposureIndex.value,
      quizIndex: quizIndex.value,
      quizOrder: quizOrder.value,
      phase: phase.value,
    }))
  }

  return {
    date,
    batch,
    exposureIndex,
    quizIndex,
    phase,
    startSession,
    recordExposure,
    recordQuiz,
    undoExposure,
    currentExposureWord,
    currentQuizWord,
    failedWords,
  }
})
