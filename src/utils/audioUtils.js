export function playAlertTone() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = 880
  gainNode.gain.value = 0.0001

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const now = audioContext.currentTime
  gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

  oscillator.start(now)
  oscillator.stop(now + 0.5)

  oscillator.onended = () => {
    audioContext.close()
  }
}
