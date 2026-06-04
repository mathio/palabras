<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { Word } from '../data/words'
import { wordIcons } from '../data/icons'

const props = defineProps<{
  word: Word
  options: Word[]
  direction: 'es-en' | 'en-es'
  useTyping?: boolean
}>()
const emit = defineEmits<{ done: [result: 'pass' | 'fail'] }>()

const selected = ref<string | null>(null)
const typed = ref('')
const submitted = ref(false)
const typedResult = ref<'pass' | 'fail' | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const question = computed(() =>
  props.direction === 'es-en' ? props.word.spanish : props.word.english,
)
const directionLabel = computed(() =>
  props.direction === 'es-en' ? 'ES → EN' : 'EN → ES',
)
const correctAnswer = computed(() =>
  props.direction === 'es-en' ? props.word.english : props.word.spanish,
)
const icon = computed(() => wordIcons[props.word.id] ?? null)

function optionLabel(w: Word) {
  return props.direction === 'es-en' ? w.english : w.spanish
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function pick(option: Word) {
  if (selected.value) return
  selected.value = option.id
  const result = option.id === props.word.id ? 'pass' : 'fail'
  setTimeout(() => emit('done', result), result === 'pass' ? 400 : 1200)
}

function submitTyped() {
  if (submitted.value) {
    emit('done', typedResult.value!)
    return
  }
  const pass = normalize(typed.value) === normalize(correctAnswer.value)
  typedResult.value = pass ? 'pass' : 'fail'
  submitted.value = true
  setTimeout(() => emit('done', typedResult.value!), pass ? 400 : 1200)
}

function stateFor(option: Word): 'correct' | 'wrong' | 'neutral' | 'idle' {
  if (!selected.value) return 'idle'
  if (option.id === props.word.id) return 'correct'
  if (option.id === selected.value) return 'wrong'
  return 'neutral'
}

onMounted(() => {
  if (props.useTyping) nextTick(() => inputEl.value?.focus())
})
</script>

<template>
  <div class="quiz-card">
    <div class="question">
      <div class="badges">
        <div class="level-badge">{{ word.level }}</div>
        <div class="dir-badge">{{ directionLabel }}</div>
      </div>
      <div class="question-word">
        <img v-if="icon && !useTyping" :src="icon" class="inline-icon" alt="" loading="lazy" />{{ question }}
      </div>
      <div v-if="direction === 'es-en'" class="example">{{ word.example }}</div>
    </div>

    <div v-if="!useTyping" class="options">
      <button
        v-for="option in options"
        :key="option.id"
        class="option"
        :class="stateFor(option)"
        @click="pick(option)"
      >
        {{ optionLabel(option) }}
      </button>
    </div>

    <div v-else class="typing-area">
      <input
        ref="inputEl"
        v-model="typed"
        class="type-input"
        :class="submitted ? (typedResult === 'pass' ? 'correct' : 'wrong') : ''"
        type="text"
        :placeholder="direction === 'es-en' ? 'type in english…' : 'escribe en español…'"
        :disabled="submitted"
        @keydown.enter="submitTyped"
      />
      <div v-if="submitted && typedResult === 'fail'" class="correct-answer">
        {{ correctAnswer }}
      </div>
      <button class="btn-check" :class="submitted ? typedResult : ''" @click="submitTyped">
        {{ submitted ? (typedResult === 'pass' ? 'correct ✓' : 'wrong ✗') : 'check' }}
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

.badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

.dir-badge {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  background: var(--surface2);
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

.question-word {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(2rem, 8vw, 2.75rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}

.inline-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
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

.typing-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 500;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--surface2);
  outline: none;
  transition: border-color 0.2s;
}

.type-input:focus {
  border-color: var(--primary);
}

.type-input.correct {
  border-color: var(--success);
  color: var(--success);
}

.type-input.wrong {
  border-color: var(--danger);
  color: var(--danger);
}

.correct-answer {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--success);
}

.btn-check {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  transition: transform 0.1s, opacity 0.1s;
}

.btn-check:active {
  transform: scale(0.97);
  opacity: 0.85;
}

.btn-check.pass {
  background: color-mix(in srgb, var(--success) 30%, transparent);
  color: var(--success);
}

.btn-check.fail {
  background: color-mix(in srgb, var(--danger) 30%, transparent);
  color: var(--danger);
}
</style>
