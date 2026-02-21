// Sound manager using Web Audio API
let audioContext = null;

// Initialize audio context on first user interaction (browser policy)
export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

// Play bling bling coin sound effect (bright, fast, sparkly)
export const playCoinSound = () => {
  initAudioContext();
  
  if (!audioContext) return;

  // Create oscillator for bling sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'square'; // Bright, metallic sound
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Bling sound pitch: starts very high, drops fast
  const basePitch = 1200 + Math.random() * 600;
  oscillator.frequency.setValueAtTime(basePitch, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(basePitch * 0.4, audioContext.currentTime + 0.1);

  // Instant attack, very quick decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

// Play level completion jingle (2-second fast happy melody)
export const playLevelCompleteJingle = () => {
  initAudioContext();
  
  if (!audioContext) return;

  // Fast melody notes (C major scale - higher octave)
  const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25, 783.99];
  const noteDurations = [0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.4];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.25);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Envelope for each note - fast attack/decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.25);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.25 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.25 + noteDurations[index]);

    oscillator.start(audioContext.currentTime + index * 0.25);
    oscillator.stop(audioContext.currentTime + index * 0.25 + noteDurations[index]);
  });

  // Fast bass notes for rhythm
  const bassNotes = [261.63, 392.00, 261.63, 392.00];
  bassNotes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.5);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.5 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.5 + 0.3);

    oscillator.start(audioContext.currentTime + index * 0.5);
    oscillator.stop(audioContext.currentTime + index * 0.5 + 0.3);
  });
};

// Play multiple bling sounds for bigger particle effects
export const playCoinSoundEffect = (count = 1) => {
  for (let i = 0; i < count; i++) {
    setTimeout(() => playCoinSound(), i * 40);
  }
};
