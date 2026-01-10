import { SOUND_SOURCES, type SoundName } from '@/services/audio';
import { useStore } from '@/store/useStore';
import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

export const useIntervalChime = () => {
  const { settings } = useStore();
  const source = SOUND_SOURCES[settings.selectedSound as SoundName] || SOUND_SOURCES.glass;
  const player = useAudioPlayer(source);

  const play = useCallback(() => {
    if (!settings.soundEnabled || !player) return;

    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Fail silently
    }
  }, [settings.soundEnabled, player]);

  return { play, isEnabled: settings.soundEnabled };
};

export const useSoundPreview = () => {
  const glassPlayer = useAudioPlayer(SOUND_SOURCES.glass);
  const woodPlayer = useAudioPlayer(SOUND_SOURCES.wood);
  const bellPlayer = useAudioPlayer(SOUND_SOURCES.bell);
  const chimePlayer = useAudioPlayer(SOUND_SOURCES.chime);
  const bowlPlayer = useAudioPlayer(SOUND_SOURCES.bowl);

  const players: Record<SoundName, typeof glassPlayer> = {
    glass: glassPlayer,
    wood: woodPlayer,
    bell: bellPlayer,
    chime: chimePlayer,
    bowl: bowlPlayer,
  };

  const playSound = useCallback(
    (soundName: SoundName) => {
      const player = players[soundName];
      if (!player) return;

      try {
        player.seekTo(0);
        player.play();
      } catch {
        // Fail silently
      }
    },
    [players]
  );

  return { playSound };
};
