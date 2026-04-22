import React from 'react';
import { AudioLiftSettings } from '../../types';

interface QuickToolsProps {
  settings: AudioLiftSettings;
  updateSettings: (settings: Partial<AudioLiftSettings>) => void;
}

const activeClass = 'bg-accent border-accent text-white shadow-sm';
const inactiveClass = 'bg-bg-secondary border-black/10 text-text-primary hover:bg-bg-primary hover:border-accent hover:text-accent';

const QuickTools: React.FC<QuickToolsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="px-4 py-2 border-b border-border-light">
      <div className="flex gap-2">
        <button
          onClick={() => updateSettings({ smartVolume: !settings.smartVolume })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1 py-1.5 px-1 border rounded text-[11px] font-medium cursor-pointer transition-all ${settings.smartVolume ? activeClass : inactiveClass}`}
          title="Standardize volume levels"
        >
          {settings.smartVolume ? '✓' : '📢'} Smart Volume
        </button>
        <button
          onClick={() => updateSettings({ mono: !settings.mono, ...(!settings.mono ? { loudnessMode: false } : {}) })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1 py-1.5 px-1 border rounded text-[11px] font-medium cursor-pointer transition-all ${settings.mono ? activeClass : inactiveClass}`}
          title="Merge to Mono"
        >
          {settings.mono ? '✓' : '🔊'} Mono
        </button>
        <button
          onClick={() => updateSettings({ loudnessMode: !settings.loudnessMode, ...(!settings.loudnessMode ? { smartVolume: false, mono: false } : {}) })}
          className={`tool-btn flex-1 flex items-center justify-center gap-1 py-1.5 px-1 border rounded text-[11px] font-medium cursor-pointer transition-all ${settings.loudnessMode ? activeClass : inactiveClass}`}
          title="Enhance bass & treble"
        >
          {settings.loudnessMode ? '✓' : '🎚️'} Loudness
        </button>
      </div>
    </div>
  );
};

export default QuickTools;
