<script setup lang="ts">
import { ref } from 'vue'
import { useProgressStore } from '../stores/progress'
import { useLanguageStore } from '../stores/language'
const emit = defineEmits<{ close: [] }>()
const progress = useProgressStore()
const lang = useLanguageStore()

const copied = ref(false)
const pasteValue = ref('')
const importState = ref<'idle' | 'success' | 'error'>('idle')

function selectPair(id: string) {
  if (id === lang.activePairId) return
  lang.setPair(id)
  emit('close')
}

function pairSessions(pairId: string): number {
  return progress.completedBatchesForPair(pairId)
}

function copyCode() {
  const code = progress.exportCode()
  navigator.clipboard.writeText(code).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function restore() {
  if (!pasteValue.value.trim()) return
  const ok = progress.importCode(pasteValue.value)
  if (ok) {
    importState.value = 'success'
    setTimeout(() => emit('close'), 1500)
  } else {
    importState.value = 'error'
    setTimeout(() => { importState.value = 'idle' }, 2500)
  }
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <div class="panel-title">language</div>

      <div class="pairs">
        <button
          v-for="pair in lang.pairs"
          :key="pair.id"
          class="pair-btn"
          :class="{ active: pair.id === lang.activePairId }"
          @click="selectPair(pair.id)"
        >
          <span class="pair-flags">{{ pair.sourceFlag }}→{{ pair.targetFlag }}</span>
          <span class="pair-name">{{ pair.sourceName }}</span>
          <span class="pair-count" :class="{ new: pairSessions(pair.id) === 0 }">
            {{ pairSessions(pair.id) === 0 ? 'new' : pairSessions(pair.id) }}
          </span>
        </button>
      </div>

      <div class="divider"><span>sync progress</span></div>

      <div class="section">
        <div class="section-label">export</div>
        <p class="hint">Copy your progress code, then paste it on another device to restore.</p>
        <button class="btn-copy" :class="{ copied }" @click="copyCode">
          {{ copied ? 'copied ✓' : 'copy progress code' }}
        </button>
      </div>

      <div class="divider">
        <span>or restore</span>
      </div>

      <div class="section">
        <div class="section-label">import</div>
        <p class="hint">Paste a progress code from another device. This overwrites your current progress.</p>
        <textarea
          v-model="pasteValue"
          class="paste-input"
          :class="{ error: importState === 'error' }"
          placeholder="paste code here…"
          rows="3"
          spellcheck="false"
          autocomplete="off"
        />
        <div v-if="importState === 'error'" class="error-msg">invalid code — check you copied the full text</div>
        <div v-if="importState === 'success'" class="success-msg">progress restored ✓</div>
        <button
          class="btn-restore"
          :disabled="!pasteValue.trim() || importState === 'success'"
          @click="restore"
        >restore</button>
      </div>

      <button class="btn-close" @click="emit('close')">close</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

.panel {
  background: var(--surface);
  border-radius: 20px 20px 16px 16px;
  padding: 1.5rem 1.5rem 1rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.pairs {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.pair-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: var(--bg);
  border: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  text-align: left;
}

.pair-btn.active {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, var(--bg));
}

.pair-btn:not(.active):active {
  background: var(--surface2);
}

.pair-flags {
  font-size: 1.15rem;
  line-height: 1;
  flex-shrink: 0;
}

.pair-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.pair-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--surface2);
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
}

.pair-count.new {
  color: var(--primary-light);
  background: color-mix(in srgb, var(--primary) 20%, transparent);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.hint {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.btn-copy {
  width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  transition: transform 0.1s, opacity 0.1s, background 0.2s;
}

.btn-copy:active {
  transform: scale(0.97);
  opacity: 0.85;
}

.btn-copy.copied {
  background: var(--success);
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--surface2);
}

.paste-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: monospace;
  background: var(--bg);
  color: var(--text);
  border: 2px solid var(--surface2);
  outline: none;
  resize: none;
  line-height: 1.4;
  transition: border-color 0.2s;
}

.paste-input:focus {
  border-color: var(--primary);
}

.paste-input.error {
  border-color: var(--danger);
}

.error-msg {
  font-size: 0.78rem;
  color: var(--danger);
}

.success-msg {
  font-size: 0.78rem;
  color: var(--success);
  font-weight: 600;
}

.btn-restore {
  width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--surface2);
  color: var(--text);
  transition: transform 0.1s, opacity 0.1s;
}

.btn-restore:disabled {
  opacity: 0.35;
  cursor: default;
}

.btn-restore:not(:disabled):active {
  transform: scale(0.97);
  opacity: 0.8;
}

.btn-close {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-muted);
  transition: color 0.15s;
}

.btn-close:active {
  color: var(--text);
}
</style>
