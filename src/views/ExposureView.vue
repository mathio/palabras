<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { words } from '../data/words'
import SwipeCard from '../components/SwipeCard.vue'
import ProgressBar from '../components/ProgressBar.vue'

const router = useRouter()
const session = useSessionStore()

onMounted(() => {
  if (session.phase !== 'exposure') router.replace('/')
})

const currentWord = computed(() => {
  const item = session.currentExposureWord()
  return item ? words.find(w => w.id === item.wordId) ?? null : null
})

const nextWord = computed(() => {
  const item = session.batch[session.exposureIndex + 1]
  return item ? words.find(w => w.id === item.wordId) ?? null : null
})

const canUndo = computed(() => session.exposureIndex > 0)

function onSwiped(flag: 'know' | 'dont-know') {
  const item = session.currentExposureWord()
  if (!item) return
  session.recordExposure(item.wordId, flag)
  if (session.phase === 'quiz') {
    router.push('/quiz')
  }
}

function undo() {
  session.undoExposure()
}

function cancel() {
  if (window.confirm('Cancel this session? Progress so far won\'t be saved.')) {
    session.cancelSession()
    router.replace('/')
  }
}
</script>

<template>
  <div class="exposure">
    <ProgressBar :current="session.exposureIndex + 1" :total="session.batch.length" />

    <button v-if="canUndo" class="undo-btn" @click="undo" aria-label="undo last swipe">
      ⎌
    </button>

    <button class="cancel-btn" @click="cancel" aria-label="cancel session">
      ✕
    </button>

    <div class="stack">
      <!-- next card peeking behind -->
      <div v-if="nextWord" class="card-behind" />

      <SwipeCard
        v-if="currentWord"
        :key="session.exposureIndex"
        :word="currentWord"
        :is-top="true"
        @swiped="onSwiped"
      />
    </div>

  </div>
</template>

<style scoped>
.exposure {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
}

.undo-btn {
  position: absolute;
  top: max(3.25rem, calc(env(safe-area-inset-top) + 2.25rem));
  left: 1rem;
  font-size: 1.1rem;
  padding: 0.35rem 0.6rem;
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-muted);
  z-index: 10;
  transition: background 0.15s, color 0.15s;
}

.undo-btn:active {
  background: var(--surface2);
  color: var(--text);
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

.stack {
  flex: 1;
  position: relative;
}

.card-behind {
  position: absolute;
  inset: 0;
  margin: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  transform: scale(0.95) translateY(10px);
  opacity: 0.5;
}
</style>
