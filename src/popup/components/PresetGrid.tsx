import React from 'react';
import { presets } from '../presets';
import { AudioLiftSettings } from '../../types';

interface PresetGridProps {
  activePreset: string | null;
  onSelect: (name: string, settings: Partial<AudioLiftSettings>) => void;
}

const PresetGrid: React.FC<PresetGridProps> = ({ activePreset, onSelect }) => {
  return (
    <div className="px-4 py-2 border-b border-border-light">
      <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1.5">Presets</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(65px,1fr))] gap-1">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onSelect(key, preset)}
            className={`preset-btn px-1 py-1.5 border rounded text-[9px] font-medium cursor-pointer transition-all whitespace-nowrap overflow-hidden text-ellipsis hover:bg-bg-primary hover:border-accent hover:text-accent hover:shadow-sm ${activePreset === key ? 'bg-accent border-accent text-white font-semibold' : 'border-black/10 bg-bg-secondary text-text-secondary'}`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetGrid;
