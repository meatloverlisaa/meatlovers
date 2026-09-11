#!/bin/bash

# Comprehensive color fix script for all dashboard pages
# Replaces blue, purple, sky, cyan, indigo, violet, fuchsia with approved colors

echo "🎨 Fixing all color violations system-wide..."

# Find all .tsx files in ui/src/app (excluding node_modules)
find /home/the-macharias/MeatLovers/meetlovers/ui/src/app -name "*.tsx" -type f | while read -r file; do
    
    # Skip if file doesn't exist
    [ ! -f "$file" ] && continue
    
    # Background colors: blue → red
    sed -i 's/bg-blue-50/bg-red-50/g' "$file"
    sed -i 's/bg-blue-100/bg-red-100/g' "$file"
    sed -i 's/bg-blue-600/bg-red-700/g' "$file"
    sed -i 's/bg-blue-700/bg-red-700/g' "$file"
    sed -i 's/bg-blue-800/bg-red-800/g' "$file"
    sed -i 's/bg-blue-900\/20/bg-red-900\/20/g' "$file"
    sed -i 's/bg-blue-900\/30/bg-red-900\/30/g' "$file"
    sed -i 's/bg-blue-950/bg-zinc-950/g' "$file"
    sed -i 's/bg-blue-950\/30/bg-zinc-950\/30/g' "$file"
    
    # Background colors: purple → red
    sed -i 's/bg-purple-50/bg-red-50/g' "$file"
    sed -i 's/bg-purple-100/bg-red-100/g' "$file"
    sed -i 's/bg-purple-600/bg-red-700/g' "$file"
    sed -i 's/bg-purple-700/bg-red-700/g' "$file"
    sed -i 's/bg-purple-800/bg-red-800/g' "$file"
    sed -i 's/bg-purple-900\/30/bg-red-900\/30/g' "$file"
    sed -i 's/bg-purple-950\/30/bg-zinc-950\/30/g' "$file"
    
    # Background colors: sky/cyan → zinc
    sed -i 's/bg-sky-50/bg-zinc-50/g' "$file"
    sed -i 's/bg-sky-100/bg-zinc-100/g' "$file"
    sed -i 's/bg-cyan-50/bg-zinc-50/g' "$file"
    sed -i 's/bg-cyan-100/bg-zinc-100/g' "$file"
    sed -i 's/bg-cyan-600\/20/bg-zinc-600\/20/g' "$file"
    
    # Background colors: indigo → red
    sed -i 's/bg-indigo-50/bg-red-50/g' "$file"
    sed -i 's/bg-indigo-100/bg-red-100/g' "$file"
    sed -i 's/bg-indigo-600/bg-red-700/g' "$file"
    sed -i 's/bg-indigo-700/bg-red-700/g' "$file"
    
    # Text colors: blue → red
    sed -i 's/text-blue-200/text-red-200/g' "$file"
    sed -i 's/text-blue-300/text-red-300/g' "$file"
    sed -i 's/text-blue-400/text-red-400/g' "$file"
    sed -i 's/text-blue-600/text-red-700/g' "$file"
    sed -i 's/text-blue-700/text-red-700/g' "$file"
    sed -i 's/text-blue-800/text-red-800/g' "$file"
    sed -i 's/text-blue-900/text-red-900/g' "$file"
    
    # Text colors: purple → red
    sed -i 's/text-purple-200/text-red-200/g' "$file"
    sed -i 's/text-purple-300/text-red-300/g' "$file"
    sed -i 's/text-purple-400/text-red-400/g' "$file"
    sed -i 's/text-purple-600/text-red-700/g' "$file"
    sed -i 's/text-purple-700/text-red-700/g' "$file"
    sed -i 's/text-purple-800/text-red-800/g' "$file"
    
    # Text colors: sky/cyan → zinc
    sed -i 's/text-sky-400/text-zinc-400/g' "$file"
    sed -i 's/text-cyan-400/text-zinc-400/g' "$file"
    
    # Border colors: blue → red
    sed -i 's/border-blue-200/border-red-200/g' "$file"
    sed -i 's/border-blue-500/border-red-700/g' "$file"
    sed -i 's/border-blue-500\/20/border-red-700\/20/g' "$file"
    sed -i 's/border-blue-500\/30/border-red-700\/30/g' "$file"
    sed -i 's/border-blue-600/border-red-700/g' "$file"
    sed -i 's/border-blue-800/border-zinc-800/g' "$file"
    sed -i 's/border-blue-900/border-zinc-900/g' "$file"
    sed -i 's/border-blue-900\/50/border-zinc-900\/50/g' "$file"
    
    # Border colors: purple → red
    sed -i 's/border-purple-200/border-red-200/g' "$file"
    sed -i 's/border-purple-500/border-red-700/g' "$file"
    sed -i 's/border-purple-600/border-red-700/g' "$file"
    sed -i 's/border-purple-800/border-zinc-800/g' "$file"
    sed -i 's/border-purple-900/border-zinc-900/g' "$file"
    sed -i 's/border-purple-900\/50/border-zinc-900\/50/g' "$file"
    
    # Hover states: blue → red
    sed -i 's/hover:bg-blue-50/hover:bg-red-50/g' "$file"
    sed -i 's/hover:bg-blue-700/hover:bg-red-800/g' "$file"
    sed -i 's/hover:bg-blue-800/hover:bg-red-800/g' "$file"
    sed -i 's/hover:bg-blue-900\/20/hover:bg-red-900\/20/g' "$file"
    sed -i 's/hover:text-blue-300/hover:text-red-300/g' "$file"
    sed -i 's/hover:text-blue-900/hover:text-red-900/g' "$file"
    sed -i 's/hover:border-blue-500/hover:border-red-700/g' "$file"
    
    # Hover states: purple → red
    sed -i 's/hover:text-purple-900/hover:text-red-900/g' "$file"
    
    # Focus states: blue → red
    sed -i 's/focus:border-blue-500/focus:border-red-700/g' "$file"
    sed -i 's/focus:ring-blue-500\/20/focus:ring-red-700\/20/g' "$file"
    
    # Gradients: blue/cyan → red/zinc
    sed -i 's/from-blue-400 to-cyan-400/from-red-400 to-red-500/g' "$file"
    sed -i 's/from-blue-600\/20 to-cyan-600\/20/from-red-700\/20 to-red-800\/20/g' "$file"
    sed -i 's/via-blue-950/via-zinc-950/g' "$file"
    
    # Dark mode variants
    sed -i 's/dark:bg-blue-900\/30/dark:bg-red-900\/30/g' "$file"
    sed -i 's/dark:bg-blue-950\/30/dark:bg-zinc-950\/30/g' "$file"
    sed -i 's/dark:text-blue-300/dark:text-red-300/g' "$file"
    sed -i 's/dark:text-blue-400/dark:text-red-400/g' "$file"
    sed -i 's/dark:border-blue-800/dark:border-zinc-800/g' "$file"
    sed -i 's/dark:border-blue-900/dark:border-zinc-900/g' "$file"
    sed -i 's/dark:border-blue-900\/50/dark:border-zinc-900\/50/g' "$file"
    
    sed -i 's/dark:bg-purple-900\/30/dark:bg-red-900\/30/g' "$file"
    sed -i 's/dark:bg-purple-950\/30/dark:bg-zinc-950\/30/g' "$file"
    sed -i 's/dark:text-purple-200/dark:text-red-200/g' "$file"
    sed -i 's/dark:text-purple-300/dark:text-red-300/g' "$file"
    sed -i 's/dark:border-purple-900/dark:border-zinc-900/g' "$file"
    sed -i 's/dark:border-purple-900\/50/dark:border-zinc-900\/50/g' "$file"
    
    # Dark mode hover states
    sed -i 's/dark:hover:bg-blue-900\/20/dark:hover:bg-red-900\/20/g' "$file"
    sed -i 's/dark:hover:text-red-300/dark:hover:text-red-300/g' "$file"
    
done

echo "✅ Color fixes applied to all dashboard pages!"
echo ""
echo "Summary of changes:"
echo "  - Blue → Red (all shades)"
echo "  - Purple → Red (all shades)"  
echo "  - Sky/Cyan → Zinc (neutral)"
echo "  - Indigo → Red (all shades)"
echo ""
echo "Approved colors:"
echo "  ✅ bg-red-700, text-red-700, border-red-700"
echo "  ✅ bg-zinc-950, text-zinc-400, border-zinc-800"
echo "  ✅ bg-emerald-700 (success only)"
echo "  ✅ bg-amber-600 (warnings only)"
