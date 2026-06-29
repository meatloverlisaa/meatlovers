"use client";

type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";

interface SupplierTypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  counts?: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  ALL: "All Types",
  FOOD: "Food",
  SOFT_DRINKS: "Soft Drinks",
  ALCOHOL: "Alcohol",
  GENERAL: "General",
};

export function SupplierTypeFilter({ selectedType, onTypeChange, counts }: SupplierTypeFilterProps) {
  const types: Array<{ value: string; label: string }> = [
    { value: "ALL", label: TYPE_LABELS.ALL },
    { value: "FOOD", label: TYPE_LABELS.FOOD },
    { value: "SOFT_DRINKS", label: TYPE_LABELS.SOFT_DRINKS },
    { value: "ALCOHOL", label: TYPE_LABELS.ALCOHOL },
    { value: "GENERAL", label: TYPE_LABELS.GENERAL },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filter by type:</span>
      {types.map((type) => {
        const count = counts?.[type.value] || 0;
        const isSelected = selectedType === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onTypeChange(type.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isSelected
                ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {type.label}
            {count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                isSelected
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
