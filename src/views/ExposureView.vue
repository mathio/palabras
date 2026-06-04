<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { words } from '../data/words'
import SwipeCard from '../components/SwipeCard.vue'
import ProgressBar from '../components/ProgressBar.vue'
import CancelConfirm from '../components/CancelConfirm.vue'

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
const showCancel = ref(false)

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
  showCancel.value = true
}

function doCancel() {
  session.cancelSession()
  router.replace('/')
}
</script>

<template>
  <div class="exposure">
    <div class="top-bar">
      <button v-if="canUndo" class="icon-btn" @click="undo" aria-label="undo last swipe">⎌</button>
      <span v-else class="icon-btn-placeholder" />
      <ProgressBar :current="session.exposureIndex + 1" :total="session.batch.length" />
      <button class="icon-btn" @click="cancel" aria-label="cancel session">✕</button>
    </div>

    <CancelConfirm v-if="showCancel" @confirm="doCancel" @dismiss="showCancel = false" />

    <div class="stack">
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
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: max(0.75rem, env(safe-area-inset-top)) 0.75rem 0;
  flex-shrink: 0;
}

.icon-btn {
  font-size: 1.1rem;
  padding: 0.35rem 0.6rem;
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-muted);
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:active {
  background: var(--surface2);
  color: var(--text);
}

.icon-btn-placeholder {
  display: inline-block;
  width: calc(1.1rem + 1.2rem);  /* same width as icon-btn */
  flex-shrink: 0;
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
