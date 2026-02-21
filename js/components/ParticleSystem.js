import { playCoinSoundEffect, playLevelCompleteJingle } from './AudioManager.js';

// Particle types with different effects
export const PARTICLE_TYPES = {
  happy: { emoji: ['✨', '⭐', '🌟', '💫'], duration: 1000, spread: 30 },
  confetti: { emoji: ['🎊', '🎉', '🎈', '🎁'], duration: 1500, spread: 40 },
  sparkles: { emoji: ['✨', '✨', '✨', '💥'], duration: 800, spread: 25 },
  hearts: { emoji: ['❤️', '💛', '💚', '💙'], duration: 1200, spread: 35 },
  stars: { emoji: ['⭐', '🌟', '⭐', '🌟'], duration: 1000, spread: 30 },
  bubbles: { emoji: ['🫧', '🫧', '🫧', '💭'], duration: 1500, spread: 40 },
  rainbows: { emoji: ['🌈', '🌈', '🌈', '🌈'], duration: 2000, spread: 300 },
  fireworks: { emoji: ['🎆', '🎇', '💥', '✨'], duration: 1200, spread: 50 }
};

// Create particles at a specific position
export const createParticles = (x, y, type = 'happy', count = 8, getPlayableBounds) => {
  const particleType = PARTICLE_TYPES[type];
  if (!particleType) return [];

  // Check if the particle origin is within the playable bounds
  const bounds = getPlayableBounds();
  if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
    return []; // Omit particle effects outside the fence
  }

  // Play sound effect based on particle type
  if (type === 'rainbows') {
    // Level completion - play special jingle
    playLevelCompleteJingle();
  } else {
    // Regular particles - play coin sound
    const soundCount = type === 'fireworks' ? 3 : 1;
    playCoinSoundEffect(soundCount);
  }

  const newParticles = [];
  for (let i = 0; i < count; i++) {
    // Calculate particle position and ensure it stays within bounds
    let px = x + (Math.random() - 0.5) * particleType.spread;
    let py = y + (Math.random() - 0.5) * particleType.spread;
    
    // Clamp particle position to playable bounds
    px = Math.max(bounds.minX, Math.min(bounds.maxX, px));
    py = Math.max(bounds.minY, Math.min(bounds.maxY, py));

    newParticles.push({
      id: Date.now() + Math.random(),
      x: px,
      y: py,
      emoji: particleType.emoji[Math.floor(Math.random() * particleType.emoji.length)],
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2 - 1, // Upward bias
      life: 0,
      maxLife: particleType.duration,
      type: type
    });
  }
  return newParticles;
};

// Update particles
export const updateParticles = (particles) => {
  const now = Date.now();
  return particles.filter(particle => {
    const age = now - particle.id; // Use id (timestamp) as birth time
    return age < particle.maxLife;
  }).map(particle => {
    const age = now - particle.id;
    const progress = age / particle.maxLife;
    
    return {
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vx: particle.vx * 0.98, // Air resistance
      vy: particle.vy + 0.05, // Gravity
      life: age
    };
  });
};
