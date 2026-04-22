export interface AudioLiftSettings {
  enabled: boolean;
  preamp: number;
  eq32: number;
  eq64: number;
  eq125: number;
  eq250: number;
  eq500: number;
  eq1k: number;
  eq2k: number;
  eq4k: number;
  eq8k: number;
  eq16k: number;
  compressionThreshold: number;
  compressionRatio: number;
  compressionKnee: number;
  compressionAttack: number;
  compressionRelease: number;
  smartVolume: boolean;
  mono: boolean;
  loudnessMode: boolean;
  stereoWidth: number; // -1 (mono) → 0 (normal) → +1 (wide)
}

export const defaultSettings: AudioLiftSettings = {
  enabled: true,
  preamp: 0,
  eq32: 0,
  eq64: 0,
  eq125: 0,
  eq250: 0,
  eq500: 0,
  eq1k: 0,
  eq2k: 0,
  eq4k: 0,
  eq8k: 0,
  eq16k: 0,
  compressionThreshold: -24,
  compressionRatio: 3,
  compressionKnee: 30,
  compressionAttack: 0.003,
  compressionRelease: 0.25,
  smartVolume: false,
  mono: false,
  loudnessMode: false,
  stereoWidth: 0
};

export interface AudioInfo {
  sampleRate: number | null;
  channels: string | null;
  bitDepth: string | null;
  codec: string | null;
  bitrate: string | null;
  duration: string | null;
}
