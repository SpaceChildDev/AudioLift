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

const Slider: React.FC<SliderProps> = ({ id, min, max, step, value, onChange, orientation = 'horizontal', disabled }) => {
  return (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`slider ${orientation === 'vertical' ? 'vertical' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      {...({ orient: orientation } as any)}
    />
  );
};

export default Slider;
