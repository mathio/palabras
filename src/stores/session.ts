import { defineStore } from 'pinia'
import { ref } from 'vue'
import { words } from '../data/words'
import { useProgressStore } from './progress'

export interface SessionWord {
  wordId: string
  exposureFlag: 'know' | 'dont-know' | null
  quizResult: 'pass' | 'fail' | null
  quizDirection: 'es-en' | 'en-es'
}

const BATCH_SIZE = 15
const MIN_NEW_RATIO = 0.5
const STORAGE_KEY = 'palabras-session'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const useSessionStore = defineStore('session', () => {
  const date = ref<string>('')
  const batch = ref<SessionWord[]>([])
  const exposureIndex = ref(0)
  const quizIndex = ref(0)
  const phase = ref<'exposure' | 'quiz' | 'results' | 'idle'>('idle')

  function buildBatch(): SessionWord[] {
    const progress = useProgressStore()
    // words due for review (seen before, nextReview <= today)
    const due = words
      .filter(w => progress.isSeen(w.id) && !progress.isLearned(w.id) && progress.isDue(w.id))
      .sort((a, b) => {
        const sa = progress.getProgress(a.id).streak
        const sb = progress.getProgress(b.id).streak
        return sa - sb // lowest streak first
      })

    // unseen new words, ordered A0 → A1 → A2
    const levelOrder = { A0: 0, A1: 1, A2: 2 }
    const newWords = words
      .filter(w => !progress.isSeen(w.id))
      .sort((a, b) => levelOrder[a.level] - levelOrder[b.level])

    const minNew = Math.ceil(BATCH_SIZE * MIN_NEW_RATIO)
    const maxDue = BATCH_SIZE - minNew

    const selectedDue = due.slice(0, maxDue)
    const remainingSlots = BATCH_SIZE - selectedDue.length
    const selectedNew = newWords.slice(0, remainingSlots)

    const combined = [...selectedDue, ...selectedNew]

    // Fallback: if still short, fill with non-learned words soonest due next
    // This allows unlimited sessions per day once new words run out
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

    // shuffle
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[combined[i], combined[j]] = [combined[j], combined[i]]
    }

    return combined.map(w => ({
      wordId: w.id,
      exposureFlag: null,
      quizResult: null,
      quizDirection: (Math.random() < 0.5 ? 'es-en' : 'en-es') as 'es-en' | 'en-es',
    }))
  }

  function startSession() {
    const saved = loadSaved()
    if (saved && saved.date === today() && !isComplete(saved)) {
      date.value = saved.date
      batch.value = saved.batch
      exposureIndex.value = saved.exposureIndex
      quizIndex.value = saved.quizIndex
      phase.value = saved.phase
    } else {
      date.value = today()
      batch.value = buildBatch()
      exposureIndex.value = 0
      quizIndex.value = 0
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
  }

  function currentExposureWord() {
    return batch.value[exposureIndex.value] ?? null
  }

  function currentQuizWord() {
    return batch.value[quizIndex.value] ?? null
  }

  function failedWords() {
    return batch.value.filter(b => b.quizResult === 'fail')
  }

  // persistence helpers
  interface SavedSession {
    date: string
    batch: SessionWord[]
    exposureIndex: number
    quizIndex: number
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
    const data: SavedSession = {
      date: date.value,
      batch: batch.value,
      exposureIndex: exposureIndex.value,
      quizIndex: quizIndex.value,
      phase: phase.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
    currentExposureWord,
    currentQuizWord,
    failedWords,
  }
})
