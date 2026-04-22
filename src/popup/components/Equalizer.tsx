import React from 'react';
import { AudioLiftSettings } from '../../types';
import Slider from './Slider';

interface EqualizerProps {
  settings: AudioLiftSettings;
  updateSettings: (settings: Partial<AudioLiftSettings>) => void;
  disabled?: boolean;
}

const bands = ['eq32', 'eq64', 'eq125', 'eq250', 'eq500', 'eq1k', 'eq2k', 'eq4k', 'eq8k', 'eq16k'] as const;
const labels = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

const Equalizer: React.FC<EqualizerProps> = ({ settings, updateSettings, disabled }) => {
  const widthLabel = settings.stereoWidth === 0 ? 'Normal'
    : settings.stereoWidth > 0 ? `+${(settings.stereoWidth * 100).toFixed(0)}% Wide`
    : `${(settings.stereoWidth * 100).toFixed(0)}% Narrow`;

  return (
    <div className="px-4 py-2 border-b border-border-light">
      <div className="section-title text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1.5">10-Band Equalizer</div>

      {/* Preamp + Stereo Width inline rows */}
      <div className="mb-1.5">
        <div className="flex justify-between items-center mb-0.5">
          <label className="text-[11px] text-text-primary">Preamp</label>
          <span className="text-[10px] text-text-secondary font-mono min-w-[50px] text-right">
            {settings.preamp >= 0 ? '+' : ''}{settings.preamp} dB
          </span>
        </div>
        <Slider id="preamp" min={-10} max={10} step={0.5}
          value={settings.preamp}
          onChange={(v) => updateSettings({ preamp: v })}
          disabled={disabled} />
      </div>

      <div className="mb-1.5">
        <div className="flex justify-between items-center mb-0.5">
          <label className="text-[11px] text-text-primary">Stereo Width</label>
          <span className="text-[10px] text-text-secondary font-mono min-w-[80px] text-right">{widthLabel}</span>
        </div>
        <Slider id="stereoWidth" min={-1} max={1} step={0.05}
          value={settings.stereoWidth}
          onChange={(v) => updateSettings({ stereoWidth: v })}
          disabled={disabled} />
      </div>

      {/* EQ bands */}
      <div className="flex justify-around items-end px-2 pt-2 pb-1.5 bg-bg-secondary rounded gap-1">
        {bands.map((band, index) => (
          <div key={band} className="flex flex-col items-center gap-0.5 flex-none" style={{ width: 22 }}>
            <label className="text-[7px] font-medium text-text-secondary tracking-wide whitespace-nowrap">{labels[index]}</label>
            <Slider id={band} min={-12} max={12} step={0.5}
              value={settings[band]}
              onChange={(v) => updateSettings({ [band]: v })}
              orientation="vertical"
              disabled={disabled} />
            <span className="text-[8px] font-medium text-accent font-mono w-full text-center leading-none">
              {settings[band]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
