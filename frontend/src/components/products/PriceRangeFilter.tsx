"use client";

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

function PriceRangeFilter({ minPrice, maxPrice, onMinChange, onMaxChange }: PriceRangeFilterProps) {
  const minVal = parseFloat(minPrice);
  const maxVal = parseFloat(maxPrice);
  const isInvalid =
    minPrice !== '' &&
    maxPrice !== '' &&
    !isNaN(minVal) &&
    !isNaN(maxVal) &&
    minVal > maxVal;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => onMinChange(e.target.value)}
          min="0"
          step="0.01"
          className="w-24 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
        <span className="text-gray-600 text-sm">–</span>
        <input
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => onMaxChange(e.target.value)}
          min="0"
          step="0.01"
          className="w-24 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>
      {isInvalid && (
        <p className="text-xs text-red-400">Min price cannot be greater than max price.</p>
      )}
    </div>
  );
}

export { PriceRangeFilter };
