import type { Word } from './words-en-es'
import { words } from './words-en-es'
import { wordsSk } from './words-sk-en'

export interface LanguagePair {
  id: string
  sourceFlag: string
  targetFlag: string
  sourceCode: string
  sourceName: string
  words: Word[]
}

export const LANGUAGE_PAIRS: LanguagePair[] = [
  {
    id: 'es-en',
    sourceFlag: '🇪🇸',
    targetFlag: '🇬🇧',
    sourceCode: 'ES',
    sourceName: 'Spanish',
    words,
  },
  {
    id: 'en-sk',
    sourceFlag: '🇬🇧',
    targetFlag: '🇸🇰',
    sourceCode: 'EN',
    sourceName: 'English',
    words: wordsSk,
  },
]
