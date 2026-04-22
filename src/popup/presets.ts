import { AudioLiftSettings } from '../types';

export type Preset = Partial<AudioLiftSettings> & { name: string };

export const presets: Record<string, Preset> = {
  flat: { name: 'Flat', preamp: 0, eq32: 0, eq64: 0, eq125: 0, eq250: 0, eq500: 0, eq1k: 0, eq2k: 0, eq4k: 0, eq8k: 0, eq16k: 0, compressionThreshold: -24, compressionRatio: 1, compressionKnee: 30 },
  audiophile: { name: 'Audiophile', preamp: 0, eq32: 1, eq64: 1, eq125: 0.5, eq250: 0, eq500: 0.5, eq1k: 0.5, eq2k: 0.5, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -40, compressionRatio: 1.5, compressionKnee: 40 },
  movie: { name: 'Movie', preamp: 2, eq32: 4, eq64: 4, eq125: 3, eq250: 2, eq500: -2, eq1k: -2, eq2k: 0, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -30, compressionRatio: 4, compressionKnee: 20 },
  dialogue: { name: 'Dialogue', preamp: 4, eq32: -3, eq64: -3, eq125: -2, eq250: -1, eq500: 6, eq1k: 6, eq2k: 5, eq4k: 3, eq8k: 2, eq16k: 1, compressionThreshold: -35, compressionRatio: 6, compressionKnee: 15 },
  music: { name: 'Music', preamp: 1, eq32: 3, eq64: 3, eq125: 2, eq250: 1, eq500: 1, eq1k: 1, eq2k: 1, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -24, compressionRatio: 2, compressionKnee: 30 },
  rock: { name: 'Rock', preamp: 2, eq32: 5, eq64: 5, eq125: 4, eq250: 2, eq500: 2, eq1k: 2, eq2k: 3, eq4k: 4, eq8k: 4, eq16k: 3, compressionThreshold: -20, compressionRatio: 3, compressionKnee: 25 },
  classical: { name: 'Classical', preamp: 0, eq32: 1, eq64: 1, eq125: 0.5, eq250: 0, eq500: -1, eq1k: -1, eq2k: -0.5, eq4k: 0, eq8k: 0.5, eq16k: 1, compressionThreshold: -35, compressionRatio: 1.5, compressionKnee: 35 },
  jazz: { name: 'Jazz', preamp: 1, eq32: 2, eq64: 2, eq125: 1.5, eq250: 1, eq500: 1, eq1k: 1, eq2k: 1, eq4k: 1, eq8k: 1.5, eq16k: 1, compressionThreshold: -28, compressionRatio: 2, compressionKnee: 30 },
  electronic: { name: 'Electronic', preamp: 3, eq32: 7, eq64: 7, eq125: 5, eq250: 3, eq500: -1, eq1k: -1, eq2k: 2, eq4k: 5, eq8k: 6, eq16k: 5, compressionThreshold: -18, compressionRatio: 4, compressionKnee: 20 },
  hiphop: { name: 'Hip Hop', preamp: 2, eq32: 8, eq64: 8, eq125: 6, eq250: 4, eq500: 0, eq1k: 0, eq2k: 1, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -22, compressionRatio: 5, compressionKnee: 18 },
  metal: { name: 'Metal', preamp: 3, eq32: 6, eq64: 6, eq125: 5, eq250: 3, eq500: 3, eq1k: 3, eq2k: 4, eq4k: 6, eq8k: 6, eq16k: 5, compressionThreshold: -15, compressionRatio: 4, compressionKnee: 15 },
  acoustic: { name: 'Acoustic', preamp: 1, eq32: 0, eq64: 0, eq125: 1, eq250: 2, eq500: 2, eq1k: 2, eq2k: 1.5, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -30, compressionRatio: 2, compressionKnee: 35 },
  podcast: { name: 'Podcast', preamp: 3, eq32: -2, eq64: -2, eq125: -1, eq250: 0, eq500: 5, eq1k: 5, eq2k: 4, eq4k: 2, eq8k: 1, eq16k: 0, compressionThreshold: -32, compressionRatio: 5, compressionKnee: 18 },
  gaming: { name: 'Gaming', preamp: 3, eq32: 6, eq64: 6, eq125: 5, eq250: 3, eq500: 0, eq1k: 0, eq2k: 1, eq4k: 3, eq8k: 3, eq16k: 2, compressionThreshold: -25, compressionRatio: 3, compressionKnee: 22 },
  night: { name: 'Night', preamp: 2, eq32: 2, eq64: 2, eq125: 2, eq250: 2, eq500: 3, eq1k: 3, eq2k: 2, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -38, compressionRatio: 8, compressionKnee: 12 },
  bassboost: { name: 'Bass+', preamp: 0, eq32: 8, eq64: 8, eq125: 7, eq250: 5, eq500: -1, eq1k: -1, eq2k: 0, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -24, compressionRatio: 3, compressionKnee: 30 },
  vocal: { name: 'Vocal', preamp: 3, eq32: -4, eq64: -4, eq125: -3, eq250: -2, eq500: 8, eq1k: 8, eq2k: 7, eq4k: 4, eq8k: 3, eq16k: 1, compressionThreshold: -32, compressionRatio: 6, compressionKnee: 16 },
  cinematic: { name: 'Cinematic', preamp: 2, eq32: 5, eq64: 5, eq125: 4, eq250: 2, eq500: -1, eq1k: -1, eq2k: 1, eq4k: 3, eq8k: 3, eq16k: 2, compressionThreshold: -28, compressionRatio: 5, compressionKnee: 22 },
  radio: { name: 'Radio', preamp: 4, eq32: -3, eq64: -3, eq125: -2, eq250: 0, eq500: 7, eq1k: 7, eq2k: 6, eq4k: 3, eq8k: 2, eq16k: 0, compressionThreshold: -30, compressionRatio: 7, compressionKnee: 14 },
  lofi: { name: 'Lo-Fi', preamp: 1, eq32: 4, eq64: 4, eq125: 3, eq250: 2, eq500: -2, eq1k: -2, eq2k: -1, eq4k: -3, eq8k: -3, eq16k: -4, compressionThreshold: -26, compressionRatio: 3, compressionKnee: 25 }
};
