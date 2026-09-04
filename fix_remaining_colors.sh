#!/bin/bash

echo "🎨 Fixing remaining dark mode color violations..."

# Fix specific dark mode violations
find /home/the-macharias/MeatLovers/meetlovers/ui/src/app -name "*.tsx" -type f | while read -r file; do
    
    # Dark mode blue fixes
    sed -i 's/dark:bg-blue-900\/40/dark:bg-red-900\/40/g' "$file"
    sed -i 's/dark:bg-blue-400/dark:bg-red-400/g' "$file"
    sed -i 's/dark:text-blue-100/dark:text-zinc-100/g' "$file"
    sed -i 's/dark:text-blue-50/dark:text-zinc-50/g' "$file"
    sed -i 's/hover:bg-blue-200/hover:bg-red-200/g' "$file"
    sed -i 's/dark:hover:bg-blue-900\/50/dark:hover:bg-red-900\/50/g' "$file"
    sed -i 's/text-blue-100/text-zinc-100/g' "$file"
    sed -i 's/text-blue-500/text-red-500/g' "$file"
    
    # Dark mode purple fixes
    sed -i 's/dark:bg-purple-900\/40/dark:bg-red-900\/40/g' "$file"
    sed -i 's/dark:bg-purple-900\/20/dark:bg-red-900\/20/g' "$file"
    
done

echo "✅ Remaining dark mode color violations fixed!"
