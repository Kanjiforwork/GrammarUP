'use client'

export type SoundType = 'correct' | 'incorrect' | 'finish'

const soundFiles: Record<SoundType, string> = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  finish: '/sounds/finish.mp3'
}

export function useSound() {
  const playSound = (type: SoundType) => {
    try {
      const audio = new Audio(soundFiles[type])
      audio.volume = 0.5 // Set volume to 50%
      audio.play().catch(err => {
        console.log('Audio playback failed:', err)
      })
    } catch (error) {
      console.log('Error playing sound:', error)
    }
  }

  return { playSound }
}