import { ProductCategory } from "../page";

type CategoryFilterProps = {
  selected: ProductCategory | "ALL";
  onSelect: (category: ProductCategory | "ALL") => void;
};

type CategoryOption = {
  value: ProductCategory | "ALL";
  label: string;
  description: string;
};

const categories: CategoryOption[] = [
  { value: "ALL", label: "All Products", description: "View all categories" },
  { value: "FOOD", label: "Food", description: "Meals & cooked items" },
  { value: "SOFT_DRINK", label: "Soft Drinks", description: "Non-alcoholic beverages" },
  { value: "ALCOHOLIC_DRINK", label: "Alcoholic Drinks", description: "Beer, wine & spirits" },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isSelected = selected === category.value;
        
        return (
          <button
            key={category.value}
            onClick={() => onSelect(category.value)}
            className={`
              flex-1 min-w-[200px] rounded-lg border p-4 text-left transition-all
              ${isSelected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-sm font-medium ${
                  isSelected 
                    ? "text-white dark:text-black" 
                    : "text-zinc-900 dark:text-zinc-50"
                }`}>
                  {category.label}
                </div>
                <div className={`mt-1 text-xs ${
                  isSelected 
                    ? "text-white/80 dark:text-black/70" 
                    : "text-zinc-600 dark:text-zinc-400"
                }`}>
                  {category.description}
                </div>
              </div>
              {isSelected && (
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
