<script setup lang="ts">
defineProps<{ current: number; total: number }>()
</script>

<template>
  <div class="progress-bar">
    <div class="track">
      <div class="fill" :style="{ width: `${(current / total) * 100}%` }" />
    </div>
    <span class="label">{{ current }} / {{ total }}</span>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0;
}

.track {
  flex: 1;
  height: 4px;
  background: var(--surface2);
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.label {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
