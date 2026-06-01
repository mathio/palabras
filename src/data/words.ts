export type Level = 'A0' | 'A1' | 'A2'

export interface Word {
  id: string
  spanish: string
  english: string
  level: Level
  example: string
}

export const words: Word[] = [
  // A0 — absolute basics
  { id: 'a0-001', spanish: 'hola', english: 'hello', level: 'A0', example: 'Hola, ¿cómo estás?' },
  { id: 'a0-002', spanish: 'adiós', english: 'goodbye', level: 'A0', example: 'Adiós, hasta mañana.' },
  { id: 'a0-003', spanish: 'gracias', english: 'thank you', level: 'A0', example: 'Gracias por tu ayuda.' },
  { id: 'a0-004', spanish: 'por favor', english: 'please', level: 'A0', example: 'Un café, por favor.' },
  { id: 'a0-005', spanish: 'sí', english: 'yes', level: 'A0', example: 'Sí, entiendo.' },
  { id: 'a0-006', spanish: 'no', english: 'no', level: 'A0', example: 'No, no quiero.' },
  { id: 'a0-007', spanish: 'agua', english: 'water', level: 'A0', example: 'Quiero un vaso de agua.' },
  { id: 'a0-008', spanish: 'casa', english: 'house', level: 'A0', example: 'Mi casa es pequeña.' },
  { id: 'a0-009', spanish: 'perro', english: 'dog', level: 'A0', example: 'El perro juega en el jardín.' },
  { id: 'a0-010', spanish: 'gato', english: 'cat', level: 'A0', example: 'El gato duerme en el sofá.' },

  // A1 — beginner
  { id: 'a1-001', spanish: 'comer', english: 'to eat', level: 'A1', example: 'Me gusta comer pizza.' },
  { id: 'a1-002', spanish: 'beber', english: 'to drink', level: 'A1', example: 'Ella quiere beber jugo.' },
  { id: 'a1-003', spanish: 'hablar', english: 'to speak', level: 'A1', example: 'Puedo hablar español un poco.' },
  { id: 'a1-004', spanish: 'trabajar', english: 'to work', level: 'A1', example: 'Él trabaja en una oficina.' },
  { id: 'a1-005', spanish: 'ciudad', english: 'city', level: 'A1', example: 'Vivo en una ciudad grande.' },
  { id: 'a1-006', spanish: 'libro', english: 'book', level: 'A1', example: 'Estoy leyendo un libro interesante.' },
  { id: 'a1-007', spanish: 'tiempo', english: 'time / weather', level: 'A1', example: 'No tengo tiempo hoy.' },
  { id: 'a1-008', spanish: 'dinero', english: 'money', level: 'A1', example: 'No tengo mucho dinero.' },
  { id: 'a1-009', spanish: 'amigo', english: 'friend', level: 'A1', example: 'Mi amigo vive en Madrid.' },
  { id: 'a1-010', spanish: 'escuela', english: 'school', level: 'A1', example: 'Los niños van a la escuela.' },

  // A2 — elementary
  { id: 'a2-001', spanish: 'conseguir', english: 'to get / to obtain', level: 'A2', example: 'Necesito conseguir un trabajo nuevo.' },
  { id: 'a2-002', spanish: 'olvidar', english: 'to forget', level: 'A2', example: 'Siempre olvido mi paraguas.' },
  { id: 'a2-003', spanish: 'recuerdo', english: 'memory / souvenir', level: 'A2', example: 'Tengo un buen recuerdo de ese viaje.' },
  { id: 'a2-004', spanish: 'reunión', english: 'meeting', level: 'A2', example: 'Tengo una reunión importante mañana.' },
  { id: 'a2-005', spanish: 'alquilar', english: 'to rent', level: 'A2', example: 'Queremos alquilar un apartamento.' },
  { id: 'a2-006', spanish: 'vecino', english: 'neighbor', level: 'A2', example: 'Mi vecino es muy simpático.' },
  { id: 'a2-007', spanish: 'extrañar', english: 'to miss (someone)', level: 'A2', example: 'Extraño mucho a mi familia.' },
  { id: 'a2-008', spanish: 'mejorar', english: 'to improve', level: 'A2', example: 'Quiero mejorar mi español.' },
  { id: 'a2-009', spanish: 'ambiente', english: 'atmosphere / environment', level: 'A2', example: 'El restaurante tiene un ambiente agradable.' },
  { id: 'a2-010', spanish: 'quejarse', english: 'to complain', level: 'A2', example: 'No me gusta quejarse de todo.' },
]
