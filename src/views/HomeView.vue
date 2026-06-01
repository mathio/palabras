<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useProgressStore } from '../stores/progress'
import { words } from '../data/words'

const router = useRouter()
const session = useSessionStore()
const progress = useProgressStore()

onMounted(() => session.startSession())

const learnedCount = computed(() => words.filter(w => progress.isLearned(w.id)).length)
const isEmpty = computed(() => session.batch.length === 0)

const buttonLabel = computed(() => {
  if (session.phase === 'results') return 'view results'
  if (session.phase === 'exposure' && session.exposureIndex > 0) return 'continue session'
  if (session.phase === 'quiz') return 'continue quiz'
  return 'start session'
})

function start() {
  if (session.phase === 'exposure') router.push('/exposure')
  else if (session.phase === 'quiz') router.push('/quiz')
  else if (session.phase === 'results') router.push('/results')
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <div class="logo">palabras</div>
      <p class="sub">your daily spanish vocabulary</p>
    </div>

    <div v-if="isEmpty" class="empty">
      <div class="empty-icon">✓</div>
      <div class="empty-title">all done for today</div>
      <div class="empty-sub">Come back tomorrow for your next batch.</div>
      <div v-if="learnedCount > 0" class="learned-count">
        {{ learnedCount }} / {{ words.length }} words learned
      </div>
    </div>

    <template v-else>
      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ session.batch.length }}</span>
          <span class="stat-label">words today</span>
        </div>
        <div v-if="learnedCount > 0" class="stat">
          <span class="stat-num">{{ learnedCount }}</span>
          <span class="stat-label">learned</span>
        </div>
      </div>

      <div class="footer">
        <button class="btn-start" @click="start">{{ buttonLabel }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg);
  padding: max(3rem, env(safe-area-inset-top)) 1.5rem 0;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logo {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub {
  color: var(--text-muted);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--success);
  margin-bottom: 0.25rem;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.empty-sub {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.learned-count {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--surface);
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
}

.stats {
  display: flex;
  gap: 2.5rem;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.stat-num {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.footer {
  width: 100%;
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

.btn-start {
  width: 100%;
  padding: 1.1rem;
  border-radius: 16px;
  background: var(--primary);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform 0.1s, opacity 0.1s;
}

.btn-start:active {
  transform: scale(0.97);
  opacity: 0.85;
}
</style>
