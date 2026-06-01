<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { words, type Word } from '../data/words'
import QuizCard from '../components/QuizCard.vue'
import ProgressBar from '../components/ProgressBar.vue'

const router = useRouter()
const session = useSessionStore()

onMounted(() => {
  if (session.phase !== 'quiz') router.replace('/')
})

const currentItem = computed(() => session.currentQuizWord())
const currentWord = computed((): Word | null => {
  const item = currentItem.value
  return item ? words.find(w => w.id === item.wordId) ?? null : null
})
const direction = computed(() => currentItem.value?.quizDirection ?? 'es-en')

const options = computed((): Word[] => {
  const word = currentWord.value
  if (!word) return []
  return buildOptions(word)
})

function buildOptions(word: Word): Word[] {
  const TOTAL = 5
  // same-level pool first, fall back to other levels
  const sameLevel = words.filter(w => w.level === word.level && w.id !== word.id)
  const otherLevel = words.filter(w => w.level !== word.level && w.id !== word.id)
  const pool = [...shuffle(sameLevel), ...shuffle(otherLevel)]
  const distractors = pool.slice(0, TOTAL - 1)
  return shuffle([word, ...distractors])
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
    <QuizCard
      v-if="currentWord"
      :key="session.quizIndex"
      :word="currentWord"
      :options="options"
      :direction="direction"
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
}
</style>
