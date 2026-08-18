/**
 * Sinais sonoros originais e opcionais, sintetizados via Web Audio API.
 * Nenhum áudio é extraído de filmes ou gravado externamente. Só toca algo
 * quando chamado a partir de uma ação explícita do usuário (ex.: enviar
 * mensagem), respeitando políticas de autoplay do navegador.
 */

export type SoundCue = 'send' | 'receive' | 'error'

let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  const AudioContextCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return null
  if (!sharedContext) {
    sharedContext = new AudioContextCtor()
  }
  return sharedContext
}

const CUE_TONES: Record<SoundCue, { frequency: number; duration: number }> = {
  send: { frequency: 880, duration: 0.07 },
  receive: { frequency: 660, duration: 0.09 },
  error: { frequency: 220, duration: 0.16 },
}

export function playCue(cue: SoundCue): void {
  const context = getContext()
  if (!context) return

  const { frequency, duration } = CUE_TONES[cue]
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = cue === 'error' ? 'sawtooth' : 'sine'
  oscillator.frequency.value = frequency

  const now = context.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}
