// Centralized Web Audio API sound generator utility for WattEveR
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Try to resume if it was suspended (due to browser autoplay rules)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  return audioCtx;
}

// Auto-initialize on first user interaction to satisfy browser autoplay guidelines
const initAudioOnInteraction = () => {
  const ctx = getAudioContext();
  if (ctx) {
    window.removeEventListener('click', initAudioOnInteraction);
    window.removeEventListener('keydown', initAudioOnInteraction);
    window.removeEventListener('touchstart', initAudioOnInteraction);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('click', initAudioOnInteraction);
  window.addEventListener('keydown', initAudioOnInteraction);
  window.addEventListener('touchstart', initAudioOnInteraction);
}

// Helper to play a tone or sweep
const playSound = (config) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const {
    freqStart,
    freqEnd = null,
    duration,
    gainStart = 0.3,
    type = 'sine',
    delay = 0
  } = config;

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, startTime);
  
  if (freqEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  }

  // Soft fade-out to prevent pops
  gainNode.gain.setValueAtTime(gainStart, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

// 1. Toggle ON: Rising tone (440Hz -> 880Hz, 0.1s duration)
export const playToggleOn = () => {
  playSound({
    freqStart: 440,
    freqEnd: 880,
    duration: 0.1
  });
};

// 2. Toggle OFF: Falling tone (880Hz -> 440Hz, 0.1s duration)
export const playToggleOff = () => {
  playSound({
    freqStart: 880,
    freqEnd: 440,
    duration: 0.1
  });
};

// 3. Button Click: Soft click single tone (600Hz, 0.05s duration)
export const playButtonClick = () => {
  playSound({
    freqStart: 600,
    duration: 0.05
  });
};

// 4. Alert Triggered: Two quick warning beeps (800Hz, 0.15s duration, 0.1s gap)
export const playAlert = () => {
  // Beep 1
  playSound({
    freqStart: 800,
    duration: 0.15,
    delay: 0
  });
  // Beep 2 (starts after 0.15s beep + 0.1s gap = 0.25s)
  playSound({
    freqStart: 800,
    duration: 0.15,
    delay: 0.25
  });
};

// 5. Payment Success: Three pleasant ascending tones (523Hz -> 659Hz -> 784Hz, 0.15s each)
export const playPaymentSuccess = () => {
  const toneDuration = 0.15;
  // Tone 1 (C5)
  playSound({
    freqStart: 523,
    duration: toneDuration,
    delay: 0
  });
  // Tone 2 (E5)
  playSound({
    freqStart: 659,
    duration: toneDuration,
    delay: 0.15
  });
  // Tone 3 (G5)
  playSound({
    freqStart: 784,
    duration: toneDuration,
    delay: 0.30
  });
};
