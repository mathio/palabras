<script setup lang="ts">
import { ref } from 'vue'
import type { Word } from '../data/words'

const props = defineProps<{ word: Word; options: Word[] }>()
const emit = defineEmits<{ done: [result: 'pass' | 'fail'] }>()

const selected = ref<string | null>(null)

function pick(option: Word) {
  if (selected.value) return
  selected.value = option.id
  const result = option.id === props.word.id ? 'pass' : 'fail'
  setTimeout(() => emit('done', result), 1200)
}

function stateFor(option: Word): 'correct' | 'wrong' | 'neutral' | 'idle' {
  if (!selected.value) return 'idle'
  if (option.id === props.word.id) return 'correct'
  if (option.id === selected.value) return 'wrong'
  return 'neutral'
}
</script>

<template>
  <div class="quiz-card">
    <div class="question">
      <div class="level-badge">{{ word.level }}</div>
      <div class="spanish">{{ word.spanish }}</div>
      <div class="example">{{ word.example }}</div>
    </div>

    <div class="options">
      <button
        v-for="option in options"
        :key="option.id"
        class="option"
        :class="stateFor(option)"
        @click="pick(option)"
      >
        {{ option.english }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.25rem max(1.25rem, env(safe-area-inset-bottom));
  gap: 1.5rem;
  overflow-y: auto;
}

.question {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 1rem 0 0.5rem;
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
  font-size: clamp(2rem, 8vw, 2.75rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}

.example {
  font-size: clamp(0.85rem, 3vw, 1rem);
  color: var(--text-muted);
  font-style: italic;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option {
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  background: var(--surface);
  color: var(--text);
  border: 2px solid transparent;
  transition: transform 0.1s, background 0.2s, border-color 0.2s, color 0.2s;
}

.option.idle:active {
  transform: scale(0.98);
  background: var(--surface2);
}

.option.correct {
  background: color-mix(in srgb, var(--success) 18%, transparent);
  border-color: var(--success);
  color: var(--success);
}

.option.wrong {
  background: color-mix(in srgb, var(--danger) 18%, transparent);
  border-color: var(--danger);
  color: var(--danger);
}

.option.neutral {
  opacity: 0.4;
}
</style>
