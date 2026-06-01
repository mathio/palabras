<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { words } from '../data/words'

const router = useRouter()
const session = useSessionStore()

onMounted(() => {
  if (session.phase !== 'results') router.replace('/')
})

const total = computed(() => session.batch.length)
const passed = computed(() => session.batch.filter(b => b.quizResult === 'pass').length)
const failed = computed(() => session.failedWords())

const failedWords = computed(() =>
  failed.value.map(item => words.find(w => w.id === item.wordId)).filter(Boolean),
)

const scorePercent = computed(() => Math.round((passed.value / total.value) * 100))

function done() {
  router.replace('/')
}
</script>

<template>
  <div class="results">
    <div class="hero">
      <div class="score-ring">
        <span class="score-num">{{ scorePercent }}%</span>
      </div>
      <div class="score-label">{{ passed }} / {{ total }} correct</div>
    </div>

    <div v-if="failedWords.length" class="missed-section">
      <div class="missed-title">review these</div>
      <div class="missed-list">
        <div v-for="word in failedWords" :key="word!.id" class="missed-item">
          <span class="missed-spanish">{{ word!.spanish }}</span>
          <span class="missed-english">{{ word!.english }}</span>
        </div>
      </div>
    </div>

    <div v-else class="perfect">
      Perfect session — all words nailed!
    </div>

    <div class="footer safe-bottom">
      <button class="btn-done" @click="done">done</button>
    </div>
  </div>
</template>

<style scoped>
.results {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  padding: max(2.5rem, env(safe-area-inset-top)) 1.25rem 0;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0 2rem;
}

.score-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-light);
}

.score-label {
  font-size: 1rem;
  color: var(--text-muted);
}

.missed-section {
  flex: 1;
  overflow-y: auto;
}

.missed-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.missed-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.missed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}

.missed-spanish {
  font-weight: 600;
  color: var(--text);
}

.missed-english {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.perfect {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--success);
  font-size: 1rem;
  font-weight: 500;
}

.footer {
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
  padding-top: 1rem;
}

.btn-done {
  width: 100%;
  padding: 1.1rem;
  border-radius: 16px;
  background: var(--surface2);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.1s, opacity 0.1s;
}

.btn-done:active {
  transform: scale(0.97);
  opacity: 0.8;
}
</style>
