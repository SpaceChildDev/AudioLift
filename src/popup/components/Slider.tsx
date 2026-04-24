import React from 'react';

interface SliderProps {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

const TRACK_HEIGHT = 60;

const Slider: React.FC<SliderProps> = ({ id, min, max, step, value, onChange, orientation = 'horizontal', disabled }) => {
  const inputEl = (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`slider ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={orientation === 'vertical' ? { width: TRACK_HEIGHT, flexShrink: 0, transform: 'rotate(-90deg)' } : undefined}
    />
  );

  if (orientation === 'vertical') {
    return (
      <div
        style={{ width: 20, height: TRACK_HEIGHT, flexShrink: 0, overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {inputEl}
      </div>
    );
  }

  return inputEl;
};

export default Slider;
