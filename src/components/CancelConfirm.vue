<script setup lang="ts">
const emit = defineEmits<{ confirm: []; dismiss: [] }>()
</script>

<template>
  <div class="overlay" @click.self="emit('dismiss')">
    <div class="sheet">
      <div class="msg">Stop this session and go home?</div>
      <div class="actions">
        <button class="btn-keep" @click="emit('dismiss')">keep going</button>
        <button class="btn-stop" @click="emit('confirm')">stop session</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 50;
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

.sheet {
  background: var(--surface);
  border-radius: 20px 20px 16px 16px;
  padding: 1.25rem 1.25rem 1rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.msg {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  text-align: center;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-keep {
  flex: 1;
  padding: 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--surface2);
  color: var(--text);
  transition: opacity 0.1s;
}

.btn-stop {
  flex: 1;
  padding: 0.9rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--danger) 20%, transparent);
  color: var(--danger);
  transition: opacity 0.1s;
}

.btn-keep:active,
.btn-stop:active {
  opacity: 0.75;
}
</style>
