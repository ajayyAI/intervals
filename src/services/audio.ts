// Premium Interval Timer - Audio Service
// Uses expo-audio (replacement for deprecated expo-av)
import { useAudioPlayer } from 'expo-audio';

// Sound names matching design spec: glass, wood, bell, chime, bowl
export type SoundName = 'glass' | 'wood' | 'bell' | 'chime' | 'bowl';

// Audio sources mapped to sound names (optimized mono 44.1kHz 128kbps)
const SOUND_SOURCES: Record<SoundName, number> = {
  glass: require('../assets/sounds/glass.mp3'),
  wood: require('../assets/sounds/wood.mp3'),
  bell: require('../assets/sounds/bell.mp3'),
  chime: require('../assets/sounds/chime.mp3'),
  bowl: require('../assets/sounds/bowl.mp3'),
};

// Available sounds list for settings
export const AVAILABLE_SOUNDS: { id: SoundName; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'wood', label: 'Wood' },
  { id: 'bell', label: 'Bell' },
  { id: 'chime', label: 'Chime' },
  { id: 'bowl', label: 'Singing Bowl' },
];

/**
 * Hook to get an audio player for the interval chime
 * Uses the new expo-audio useAudioPlayer hook
 */
export const useIntervalChime = (soundName: SoundName = 'glass') => {
  const source = SOUND_SOURCES[soundName];

  // useAudioPlayer handles lifecycle automatically
  const player = useAudioPlayer(source);

  const playChime = () => {
    if (player) {
      player.seekTo(0);
      player.play();
    }
  };

  return { playChime, isReady: true };
};

/**
 * Get sound label for display
 */
export const getSoundLabel = (soundName: string): string => {
  const sound = AVAILABLE_SOUNDS.find((s) => s.id === soundName);
  return sound?.label ?? 'Unknown';
};
