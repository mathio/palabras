import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LANGUAGE_PAIRS } from '../data/languages'

const ACTIVE_PAIR_KEY = 'palabras-active-pair'

export const useLanguageStore = defineStore('language', () => {
  const activePairId = ref(localStorage.getItem(ACTIVE_PAIR_KEY) ?? 'es-en')
  const activePair = computed(() => LANGUAGE_PAIRS.find(p => p.id === activePairId.value) ?? LANGUAGE_PAIRS[0])

  function setPair(id: string) {
    activePairId.value = id
    localStorage.setItem(ACTIVE_PAIR_KEY, id)
  }

  return { activePairId, activePair, setPair, pairs: LANGUAGE_PAIRS }
})
