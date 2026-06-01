<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Word } from '../data/words'

const props = defineProps<{ word: Word; isTop: boolean }>()
const emit = defineEmits<{ swiped: [flag: 'know' | 'dont-know'] }>()

const startX = ref(0)
const deltaX = ref(0)
const isDragging = ref(false)
const isFlying = ref(false)
const flyRight = ref(false)

const THRESHOLD = 80

const cardStyle = computed(() => {
  if (isFlying.value) {
    const x = flyRight.value ? '150vw' : '-150vw'
    const rot = flyRight.value ? '30deg' : '-30deg'
    return { transform: `translateX(${x}) rotate(${rot})`, transition: 'transform 0.35s ease-in' }
  }
  if (isDragging.value) {
    const rot = deltaX.value * 0.06
    return { transform: `translateX(${deltaX.value}px) rotate(${rot}deg)` }
  }
  return { transform: 'translateX(0) rotate(0deg)', transition: 'transform 0.3s ease-out' }
})

const knowOpacity = computed(() => Math.max(0, Math.min(deltaX.value / THRESHOLD, 1)))
const dontKnowOpacity = computed(() => Math.max(0, Math.min(-deltaX.value / THRESHOLD, 1)))

function onPointerDown(e: PointerEvent) {
  if (!props.isTop || isFlying.value) return
  startX.value = e.clientX
  deltaX.value = 0
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  deltaX.value = e.clientX - startX.value
}

function onPointerUp() {
  if (!isDragging.value) return
  isDragging.value = false
  if (Math.abs(deltaX.value) >= THRESHOLD) {
    commit(deltaX.value > 0 ? 'know' : 'dont-know')
  } else {
    deltaX.value = 0
  }
}

function commit(flag: 'know' | 'dont-know') {
  flyRight.value = flag === 'know'
  isFlying.value = true
  setTimeout(() => emit('swiped', flag), 350)
}
</script>

<template>
  <div
    class="card"
    :style="cardStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- swipe indicators -->
    <div class="indicator know" :style="{ opacity: knowOpacity }">KNOW IT</div>
    <div class="indicator dont-know" :style="{ opacity: dontKnowOpacity }">NO IDEA</div>

    <div class="content">
      <div class="level-badge">{{ word.level }}</div>
      <div class="spanish">{{ word.spanish }}</div>
      <div class="english">{{ word.english }}</div>
      <div class="divider" />
      <div class="example">{{ word.example }}</div>
    </div>

    <!-- tap buttons fallback -->
    <div class="actions">
      <button class="btn-dont" @click.stop="commit('dont-know')">✗ Don't know</button>
      <button class="btn-know" @click.stop="commit('know')">✓ Know it</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: absolute;
  inset: 0;
  margin: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  touch-action: none;
  user-select: none;
  cursor: grab;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.card:active {
  cursor: grabbing;
}

.indicator {
  position: absolute;
  top: 2rem;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border-width: 3px;
  border-style: solid;
  pointer-events: none;
  transition: opacity 0.05s;
}

.indicator.know {
  right: 1.5rem;
  color: var(--success);
  border-color: var(--success);
  transform: rotate(12deg);
}

.indicator.dont-know {
  left: 1.5rem;
  color: var(--danger);
  border-color: var(--danger);
  transform: rotate(-12deg);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.75rem 1rem;
  text-align: center;
  gap: 0.75rem;
}

.level-badge {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--primary-light);
  background: color-mix(in srgb, var(--primary) 20%, transparent);
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

.spanish {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}

.english {
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  color: var(--primary-light);
  font-weight: 500;
}

.divider {
  width: 40px;
  height: 2px;
  background: var(--surface2);
  margin: 0.25rem 0;
}

.example {
  font-size: clamp(0.85rem, 3vw, 1rem);
  color: var(--text-muted);
  font-style: italic;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem max(1.25rem, env(safe-area-inset-bottom));
}

.actions button {
  flex: 1;
  padding: 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.1s, opacity 0.1s;
}

.actions button:active {
  transform: scale(0.96);
  opacity: 0.8;
}

.btn-dont {
  background: color-mix(in srgb, var(--danger) 15%, transparent);
  color: var(--danger);
}

.btn-know {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}
</style>
