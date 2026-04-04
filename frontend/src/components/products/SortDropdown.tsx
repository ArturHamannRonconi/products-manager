"use client";

interface SortDropdownProps {
  value: string;
  onChange: (sortBy: string, order: string) => void;
}

const SORT_OPTIONS = [
  { label: "Most recent", value: "createdAt_desc", sortBy: "createdAt", order: "desc" },
  { label: "Name (A-Z)", value: "name_asc", sortBy: "name", order: "asc" },
  { label: "Name (Z-A)", value: "name_desc", sortBy: "name", order: "desc" },
  { label: "Lowest price", value: "price_asc", sortBy: "price", order: "asc" },
  { label: "Highest price", value: "price_desc", sortBy: "price", order: "desc" },
];

function SortDropdown({ value, onChange }: SortDropdownProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const option = SORT_OPTIONS.find((o) => o.value === e.target.value);
    if (option) {
      onChange(option.sortBy, option.order);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#111118] text-white">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { SortDropdown };
