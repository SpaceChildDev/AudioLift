import React from 'react';
import { AudioInfo } from '../../types';

interface AudioInfoPanelProps {
  info: AudioInfo;
}

const AudioInfoPanel: React.FC<AudioInfoPanelProps> = ({ info }) => {
  const items = [
    { label: 'Rate', value: info.sampleRate ? `${(info.sampleRate / 1000).toFixed(1)}k` : '-' },
    { label: 'Channels', value: info.channels || '-' },
    { label: 'Bit Depth', value: info.bitDepth || '-' },
    { label: 'Codec', value: info.codec || '?' },
    { label: 'Bitrate', value: info.bitrate || '?' },
    { label: 'Duration', value: info.duration || '-' },
  ];

  return (
    <div className="bg-bg-secondary border-b border-border-primary px-4 py-2 grid grid-cols-3 gap-x-4 gap-y-1.5 flex-shrink-0">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <span className="text-[9px] text-text-secondary font-normal uppercase tracking-wide">{item.label}</span>
          <span className="text-[10px] text-text-primary font-medium font-mono whitespace-nowrap overflow-hidden text-ellipsis">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default AudioInfoPanel;
