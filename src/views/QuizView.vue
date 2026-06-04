<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { words, type Word } from '../data/words'
import QuizCard from '../components/QuizCard.vue'
import ContextualQuizCard from '../components/ContextualQuizCard.vue'
import ProgressBar from '../components/ProgressBar.vue'

const router = useRouter()
const session = useSessionStore()

onMounted(() => {
  if (session.phase !== 'quiz') router.replace('/')
})

function cancel() {
  if (window.confirm('Cancel this session? Progress so far won\'t be saved.')) {
    session.cancelSession()
    router.replace('/')
  }
}

const currentItem = computed(() => session.currentQuizWord())
const currentWord = computed((): Word | null => {
  const item = currentItem.value
  return item ? words.find(w => w.id === item.wordId) ?? null : null
})
const direction = computed(() => currentItem.value?.quizDirection ?? 'es-en')
const quizMode = computed(() => currentItem.value?.quizMode ?? 'word')
const useTyping = computed(() => (currentItem.value?.quizInputMode ?? 'choice') === 'type')

const options = computed((): Word[] => {
  const word = currentWord.value
  if (!word) return []
  return buildOptions(word)
})

function getCategory(id: string): string {
  // Normalise subcategories that should be grouped
  if (id.startsWith('food-')) return 'food'
  if (id.startsWith('fam')) return 'family'   // fam- and fam2-
  const m = id.match(/^([a-z]+)/)
  return m ? m[1] : 'misc'
}

function buildOptions(word: Word): Word[] {
  const TOTAL = 5
  const needed = TOTAL - 1
  const category = getCategory(word.id)

  // 1. same category (excluding the word itself)
  const sameCategory = shuffle(words.filter(w => w.id !== word.id && getCategory(w.id) === category))

  // 2. top up with same-level words if category pool runs short
  const usedIds = new Set([word.id, ...sameCategory.map(w => w.id)])
  const sameLevel = shuffle(words.filter(w => !usedIds.has(w.id) && w.level === word.level))

  // 3. final fallback: any remaining word
  const usedIds2 = new Set([...usedIds, ...sameLevel.map(w => w.id)])
  const rest = shuffle(words.filter(w => !usedIds2.has(w.id)))

  const pool = [...sameCategory, ...sameLevel, ...rest]
  return shuffle([word, ...pool.slice(0, needed)])
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function onDone(result: 'pass' | 'fail') {
  const item = session.currentQuizWord()
  if (!item) return
  session.recordQuiz(item.wordId, result)
  if (session.phase === 'results') {
    router.push('/results')
  }
}
</script>

<template>
  <div class="quiz">
    <ProgressBar :current="session.quizIndex + 1" :total="session.batch.length" />
    <button class="cancel-btn" @click="cancel" aria-label="cancel session">✕</button>
    <QuizCard
      v-if="quizMode === 'word' && currentWord"
      :key="session.quizIndex"
      :word="currentWord"
      :options="options"
      :direction="direction"
      :use-typing="useTyping"
      @done="onDone"
    />
    <ContextualQuizCard
      v-else-if="quizMode === 'contextual' && currentWord"
      :key="session.quizIndex"
      :word="currentWord"
      :options="options"
      :use-typing="useTyping"
      @done="onDone"
    />
  </div>
</template>

<style scoped>
.quiz {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
}

.cancel-btn {
  position: absolute;
  top: max(3.25rem, calc(env(safe-area-inset-top) + 2.25rem));
  right: 1rem;
  font-size: 1.1rem;
  padding: 0.35rem 0.6rem;
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-muted);
  z-index: 10;
  transition: background 0.15s, color 0.15s;
}

.cancel-btn:active {
  background: var(--surface2);
  color: var(--text);
}
</style>
