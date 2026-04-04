'use client';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  onChange: (value: number) => void;
}

function QuantitySelector({ value, min = 1, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value === min}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        −
      </button>
      <span className="w-9 text-center text-sm font-medium text-white tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
      >
        +
      </button>
    </div>
  );
}

export { QuantitySelector };
