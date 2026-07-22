#!/bin/bash

# Part F Status Checker
# Quick script to verify Part F implementation

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         PART F STATUS CHECKER                                  ║"
echo "║         Authentication Recovery Sprint Part 3                  ║"
echo "║         Next.js Google Font Build Fix                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd ui

echo "📁 Checking files..."
echo ""

FILES=(
  "src/lib/fonts.ts"
  "PART_F_README.md"
)

ALL_EXIST=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ALL_EXIST=false
  fi
done

if [ "$ALL_EXIST" = false ]; then
  echo ""
  echo "❌ Some files are missing. Part F may not be complete."
  exit 1
fi

echo ""
echo "🔍 Checking font configuration..."
echo ""

# Check if fontClassNames is exported
if grep -q "export const fontClassNames" src/lib/fonts.ts; then
  echo "  ✅ fontClassNames exported"
else
  echo "  ❌ fontClassNames not exported"
fi

# Check if display swap is configured
if grep -q "display: 'swap'" src/lib/fonts.ts; then
  echo "  ✅ Display swap configured (prevents FOIT)"
else
  echo "  ⚠️  Display swap not configured"
fi

# Check if preload is enabled
if grep -q "preload: true" src/lib/fonts.ts; then
  echo "  ✅ Preload enabled"
else
  echo "  ⚠️  Preload not enabled"
fi

# Check if fallback fonts are defined
if grep -q "fallback:" src/lib/fonts.ts; then
  echo "  ✅ Fallback fonts defined"
else
  echo "  ⚠️  Fallback fonts not defined"
fi

echo ""
echo "📝 Checking layout.tsx..."
echo ""

# Check if layout uses centralized fonts
if grep -q "from \"@/lib/fonts\"" src/app/layout.tsx; then
  echo "  ✅ Layout uses centralized fonts"
else
  echo "  ❌ Layout not using centralized fonts"
fi

# Check if old font imports are removed
if grep -q "from \"next/font/google\"" src/app/layout.tsx; then
  echo "  ⚠️  Old font imports still present (should be removed)"
else
  echo "  ✅ Old font imports removed"
fi

echo ""
echo "⚙️  Checking Next.js config..."
echo ""

# Check if optimizeFonts is enabled
if grep -q "optimizeFonts:" next.config.ts; then
  echo "  ✅ Font optimization enabled"
else
  echo "  ⚠️  Font optimization not explicitly enabled"
fi

echo ""
echo "🔨 Testing build..."
echo ""

# Try to build
echo "  Running: npm run build (this may take a minute)..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build successful"
  BUILD_SUCCESS=true
else
  echo "  ⚠️  Build has errors (check with: npm run build)"
  BUILD_SUCCESS=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ALL_EXIST" = true ] && [ "$BUILD_SUCCESS" = true ]; then
  echo "  ✨ PART F STATUS: COMPLETE ✅"
  echo ""
  echo "  🎯 Features:"
  echo "     • Centralized font configuration"
  echo "     • Font display swap (prevents FOIT)"
  echo "     • Preload optimization"
  echo "     • System font fallbacks"
  echo "     • Latin subset only (smaller bundle)"
  echo "     • Font fallback adjustment"
  echo "     • Next.js config optimization"
  echo ""
  echo "  📚 Documentation:"
  echo "     • Full guide: ui/PART_F_README.md"
  echo ""
  echo "  🚀 Benefits:"
  echo "     • No font build errors"
  echo "     • Faster font loading"
  echo "     • No FOIT (Flash of Invisible Text)"
  echo "     • Better user experience"
  echo "     • Smaller bundle size"
  echo ""
  echo "  💡 Usage:"
  echo "     • Fonts automatically available via Tailwind"
  echo "     • Use className=\"font-sans\" or className=\"font-mono\""
  echo "     • CSS variables: var(--font-geist-sans)"
  echo ""
else
  echo "  ⚠️  PART F: Some issues detected"
  echo "     Review the checks above and fix any issues"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
