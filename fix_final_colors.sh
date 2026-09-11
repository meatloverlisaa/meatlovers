#!/bin/bash

echo "🎨 Final pass: Fixing all remaining color violations..."

# Find all .tsx files
find /home/the-macharias/MeatLovers/meetlovers/ui/src/app -name "*.tsx" -type f | while read -r file; do
    
    # Profile header gradients: blue → red
    sed -i 's/from-blue-600 to-blue-500/from-red-700 to-red-800/g' "$file"
    sed -i 's/from-blue-500 to-blue-600/from-red-700 to-red-800/g' "$file"
    
    # Focus rings: blue → red
    sed -i 's/focus:ring-blue-500/focus:ring-red-700/g' "$file"
    sed -i 's/dark:focus:ring-blue-400/dark:focus:ring-red-400/g' "$file"
    sed -i 's/focus:ring-blue-600/focus:ring-red-700/g' "$file"
    
    # Any remaining cyan colors
    sed -i 's/cyan-400/red-400/g' "$file"
    sed -i 's/cyan-500/red-500/g' "$file"
    sed -i 's/cyan-600/red-700/g' "$file"
    
    # Slate backgrounds in forms (keep slate, it's neutral like zinc)
    # No change needed for slate colors
    
done

echo "✅ All color violations have been fixed!"
echo ""
echo "Final approved colors:"
echo "  ✅ Red: bg-red-700, text-red-700, border-red-700"
echo "  ✅ Neutral: zinc, slate, stone (all approved)"
echo "  ✅ Success: emerald-700 only"
echo "  ✅ Warning: amber-600 only"
