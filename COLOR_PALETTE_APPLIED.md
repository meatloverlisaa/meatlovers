# 🎨 Color Palette - System-Wide Application

**Status:** Applied across all modules  
**Date:** August 24, 2026

---

## 🎯 Color System

### Primary Colors

**Deep Crimson Red (#B91C1C / bg-red-700)**
- Brand color and primary accent
- Active navigation items (Admin, Manager, Staff)
- User profile avatars
- Primary buttons and CTAs
- Key stats, metrics, price highlights

**Dark Charcoal / Near-Black (#09090B / bg-zinc-950)**
- Sidebar menus (all portals)
- Header bars
- Modal backgrounds
- Public sections (hero, catering, footer)

### Background Colors

**Warm Off-White (#FAFAF9 / bg-stone-50)**
- Application-wide background
- Set in globals.css

**Pure White (#FFFFFF / bg-white)**
- Content containers
- Cards with subtle borders

### Secondary Accents

**Emerald Green (#047857 / emerald-700)**
- Category badges
- Operational status tags
- Success states

**Amber (#D97706 / amber-600)**
- Pending states
- Alerts and warnings

---

## 📁 Files Modified

### Core Styles
- `ui/src/app/globals.css` - Base palette and CSS variables

### Layout Files
- `ui/src/app/super-admin/layout.tsx`
- `ui/src/app/admin/layout.tsx`
- `ui/src/app/manager/layout.tsx`
- `ui/src/app/accountant/layout.tsx`
- `ui/src/app/bar/layout.tsx`
- `ui/src/app/dispatcher/layout.tsx`
- `ui/src/app/kitchen/layout.tsx`
- `ui/src/app/storekeeper/layout.tsx`

### Component Updates
- Sidebar navigation (active states)
- Buttons and CTAs
- Status badges
- Profile avatars
- Modal backgrounds

---

## 🚀 Applied To GitHub

**Repository:** https://github.com/meatloverlisaa/meatlovers
**Branch:** main
**Commit:** "Apply system-wide color palette: Deep Crimson Red primary, consistent dark sidebars"

---

## ✅ Verification Checklist

- [x] Primary accent (Deep Crimson Red) applied to active nav items
- [x] Dark sidebars (zinc-950) consistent across all portals
- [x] Background (stone-50) set in globals.css
- [x] Content cards (white) with proper contrast
- [x] Secondary accents (emerald, amber) for status indicators
- [x] All layouts updated
- [x] Changes committed to Git
- [x] Pushed to GitHub

---

## 🎨 Usage Examples

### Primary Button
```tsx
<button className="bg-red-700 hover:bg-red-800 text-white">
  Click Me
</button>
```

### Active Navigation
```tsx
<Link className="bg-red-700 text-white">
  Dashboard
</Link>
```

### Status Badge (Success)
```tsx
<span className="bg-emerald-700 text-white">
  Active
</span>
```

### Status Badge (Pending)
```tsx
<span className="bg-amber-600 text-white">
  Pending
</span>
```

### Sidebar
```tsx
<aside className="bg-zinc-950 text-white">
  {/* Navigation */}
</aside>
```

### Content Container
```tsx
<div className="bg-white border border-gray-200 rounded-lg">
  {/* Content */}
</div>
```

---

## 📊 Color Reference Chart

| Purpose | Color | Tailwind Class | Hex |
|---------|-------|---------------|-----|
| Primary Accent | Deep Crimson Red | `bg-red-700` | #B91C1C |
| Primary Hover | Darker Crimson | `hover:bg-red-800` | #991B1B |
| Sidebar/Header | Dark Charcoal | `bg-zinc-950` | #09090B |
| Page Background | Warm Off-White | `bg-stone-50` | #FAFAF9 |
| Content Cards | Pure White | `bg-white` | #FFFFFF |
| Success/Active | Emerald Green | `bg-emerald-700` | #047857 |
| Warning/Pending | Amber | `bg-amber-600` | #D97706 |

---

**Palette is now consistently applied across the entire application! 🎉**
