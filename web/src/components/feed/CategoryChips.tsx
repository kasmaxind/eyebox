"use client";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/format";

const defaultCategories: Category[] = [
  "All",
  "Music",
  "Gaming",
  "News",
  "Live",
  "Learning",
  "Sports",
  "Tech",
  "Comedy",
  "Podcasts",
  "Film",
  "Recently uploaded",
  "Watched",
];

export function CategoryChips({
  value,
  onChange,
  categories = defaultCategories,
}: {
  value: Category;
  onChange: (c: Category) => void;
  categories?: Category[];
}) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          className={cn("chip")}
          data-active={value === c}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
