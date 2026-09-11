# Kitchen Recipes Module

Complete recipe management interface for kitchen staff.

## Structure

```
recipes/
├── page.tsx          # Recipe list page (main)
├── [id]/
│   └── page.tsx      # Recipe detail page
└── README.md         # This file
```

## Pages

### 1. Recipe List (`/kitchen/recipes`)
- Displays all active recipes in a grid
- Search by recipe/product name
- Filter by category
- Expandable recipe cards
- Shows cost, price, margin

### 2. Recipe Detail (`/kitchen/recipes/[id]`)
- Full recipe information
- Portion calculator
- Stock availability checking
- Preparation instructions
- Cost breakdown

## Features

- Real-time search filtering
- Category-based filtering
- Expandable ingredient lists
- Portion scaling calculator
- Stock level warnings
- Cost/margin calculations
- Responsive design
- Dark mode support
- Authentication enforced

## Access Control

**Allowed Roles:**
- SUPER_ADMIN
- ADMIN
- MANAGER
- CHEF

**Redirect Behavior:**
- No auth → `/kitchen/login`
- Wrong role → User's own dashboard

## API Endpoints

```typescript
GET /recipes              // List all recipes
GET /recipes/:id          // Get recipe by ID
GET /recipes/product/:id  // Get recipe by product ID
```

## Data Flow

```
User → Recipe List Page
      ↓
   Search/Filter
      ↓
  Click Recipe Card
      ↓
Recipe Detail Page
      ↓
Adjust Portions
      ↓
View Scaled Ingredients
```

## Dependencies

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Auth Context (`useRequireAuth`)
- Auth Helper (`getAuthHeader`)

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Usage Example

```tsx
// Import
import RecipesPage from '@/app/kitchen/recipes/page';

// Navigate
router.push('/kitchen/recipes');

// Or use Link
<Link href="/kitchen/recipes">View Recipes</Link>
```

## Development

```bash
# Run dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## Testing

See `KITCHEN_RECIPES_TESTING_GUIDE.md` in project root.

## Documentation

- Implementation: `KITCHEN_RECIPES_MODULE_COMPLETE.md`
- Visual Guide: `KITCHEN_RECIPES_VISUAL_GUIDE.md`
- Testing: `KITCHEN_RECIPES_TESTING_GUIDE.md`
- Summary: `KITCHEN_RECIPES_SUMMARY.md`

## Support

For issues or questions, refer to the main documentation files in the project root.
