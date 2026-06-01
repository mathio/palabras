<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'

const router = useRouter()
const session = useSessionStore()

onMounted(() => session.startSession())

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

    <div class="card-info">
      <div class="stat">
        <span class="stat-num">{{ session.batch.length }}</span>
        <span class="stat-label">words today</span>
      </div>
    </div>

    <div class="footer safe-bottom">
      <button class="btn-start" @click="start">
        {{ session.phase === 'results' ? 'View results' : 'Start session' }}
      </button>
    </div>
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

.card-info {
  display: flex;
  gap: 2rem;
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
