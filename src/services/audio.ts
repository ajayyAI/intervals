export type SoundName = 'glass' | 'wood' | 'bell' | 'chime' | 'bowl';

export const SOUND_SOURCES: Record<SoundName, number> = {
  glass: require('../assets/sounds/glass.mp3'),
  wood: require('../assets/sounds/wood.mp3'),
  bell: require('../assets/sounds/bell.mp3'),
  chime: require('../assets/sounds/chime.mp3'),
  bowl: require('../assets/sounds/bowl.mp3'),
};

export const AVAILABLE_SOUNDS: { id: SoundName; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'wood', label: 'Wood' },
  { id: 'bell', label: 'Bell' },
  { id: 'chime', label: 'Chime' },
  { id: 'bowl', label: 'Singing Bowl' },
];

/**
 * Get sound label for display
 */
export const getSoundLabel = (soundName: string): string => {
  const sound = AVAILABLE_SOUNDS.find((s) => s.id === soundName);
  return sound?.label ?? 'Unknown';
};
