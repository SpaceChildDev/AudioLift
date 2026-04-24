import React, { useState } from 'react';
import { AudioLiftSettings } from '../../types';
import Slider from './Slider';

interface CompressorProps {
  settings: AudioLiftSettings;
  updateSettings: (settings: Partial<AudioLiftSettings>) => void;
  disabled?: boolean;
}

const Compressor: React.FC<CompressorProps> = ({ settings, updateSettings, disabled }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="px-4 py-2 border-b border-border-light relative">
      <div className="section-title text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1.5 flex justify-between items-center">
        <span>Compression</span>
        <button 
          className="w-4 h-4 rounded-full border border-border-secondary bg-bg-primary text-text-secondary text-[11px] font-medium cursor-pointer transition-all flex items-center justify-center hover:bg-bg-secondary hover:border-text-secondary"
          onClick={() => setShowHelp(!showHelp)}
        >
          ?
        </button>
      </div>

      <div className={`flex flex-col gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-xs text-text-primary">Threshold</label>
            <span className="text-[11px] text-text-secondary font-mono text-right">{settings.compressionThreshold} dB</span>
          </div>
          <Slider 
            id="threshold" min={-60} max={0} step={1} 
            value={settings.compressionThreshold} 
            onChange={(v) => updateSettings({ compressionThreshold: v })} 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-xs text-text-primary">Ratio</label>
            <span className="text-[11px] text-text-secondary font-mono text-right">{settings.compressionRatio}:1</span>
          </div>
          <Slider 
            id="ratio" min={1} max={20} step={0.5} 
            value={settings.compressionRatio} 
            onChange={(v) => updateSettings({ compressionRatio: v })} 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-xs text-text-primary">Knee</label>
            <span className="text-[11px] text-text-secondary font-mono text-right">{settings.compressionKnee} dB</span>
          </div>
          <Slider 
            id="knee" min={0} max={40} step={1} 
            value={settings.compressionKnee} 
            onChange={(v) => updateSettings({ compressionKnee: v })} 
          />
        </div>
      </div>

      {showHelp && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary rounded-lg shadow-lg w-full max-w-[280px] overflow-hidden animate-[modalSlide_0.2s_ease]">
            <div className="flex justify-between items-center p-3 border-b border-border-primary">
              <h3 className="text-sm font-medium text-text-primary">Dynamic Compression</h3>
              <button onClick={() => setShowHelp(false)} className="text-lg text-text-secondary hover:bg-bg-secondary w-6 h-6 rounded-full flex items-center justify-center">&times;</button>
            </div>
            <div className="p-3 max-h-[300px] overflow-y-auto text-xs text-text-primary space-y-2">
              <p>Compression reduces the difference between quiet and loud sounds.</p>
              <div>
                <strong>Threshold:</strong> Volume level where compression starts. Lower = more compression.
              </div>
              <div>
                <strong>Ratio:</strong> How much to compress. Higher = more aggressive.
              </div>
              <div>
                <strong>Knee:</strong> Smoothness of transition.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compressor;
