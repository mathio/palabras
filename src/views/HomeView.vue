<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { useProgressStore } from '../stores/progress'
import { words } from '../data/words'

const router = useRouter()
const session = useSessionStore()
const progress = useProgressStore()

onMounted(() => session.startSession())

const learnedCount = computed(() => words.filter(w => progress.isLearned(w.id)).length)
const completedBatches = computed(() => progress.completedBatches)
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

// Per-level progress panel
const showStats = ref(false)

const levelStats = computed(() => {
  return (['A0', 'A1', 'A2'] as const).map(level => {
    const levelWords = words.filter(w => w.level === level)
    const seen = levelWords.filter(w => progress.isSeen(w.id)).length
    const learned = levelWords.filter(w => progress.isLearned(w.id)).length
    return { level, total: levelWords.length, seen, learned, pct: Math.round((seen / levelWords.length) * 100) }
  })
})
</script>

<template>
  <div class="home">
    <button
      v-if="completedBatches > 0"
      class="batch-counter"
      @click="showStats = !showStats"
    >{{ completedBatches }}</button>

    <div v-if="showStats" class="stats-panel" @click.self="showStats = false">
      <div class="stats-card">
        <div class="stats-title">progress by level</div>
        <div class="level-rows">
          <div v-for="s in levelStats" :key="s.level" class="level-row">
            <div class="level-label">{{ s.level }}</div>
            <div class="bar-wrap">
              <div class="bar-fill" :style="{ width: s.pct + '%' }" />
            </div>
            <div class="level-pct">{{ s.pct }}%</div>
            <div class="level-detail">{{ s.seen }}/{{ s.total }}</div>
          </div>
        </div>
        <div class="stats-sub">{{ learnedCount }} / {{ words.length }} total learned</div>
        <button class="stats-close" @click="showStats = false">close</button>
      </div>
    </div>

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
  position: relative;
}

.batch-counter {
  position: absolute;
  top: max(1rem, env(safe-area-inset-top));
  right: 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--surface);
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.batch-counter:hover {
  background: var(--surface2);
  color: var(--text);
}

/* Stats overlay */
.stats-panel {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

.stats-card {
  background: var(--surface);
  border-radius: 20px 20px 16px 16px;
  padding: 1.5rem 1.5rem 1rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.level-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-row {
  display: grid;
  grid-template-columns: 2rem 1fr 2.5rem 3.5rem;
  align-items: center;
  gap: 0.6rem;
}

.level-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--primary-light);
}

.bar-wrap {
  height: 8px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: 99px;
  transition: width 0.4s ease-out;
  min-width: 2px;
}

.level-pct {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
  text-align: right;
}

.level-detail {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-align: right;
}

.stats-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

.stats-close {
  width: 100%;
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--surface2);
  color: var(--text);
  transition: opacity 0.1s;
}

.stats-close:active {
  opacity: 0.7;
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
