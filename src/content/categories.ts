import type { Category, CategoryMeta } from "./types";

/**
 * Fixed set of ways to browse the journal. Kept in code (not the database) because the
 * gallery filter, copy and the SQL `check` constraint on postcards.category all rely on it.
 */
export const CATEGORIES: readonly CategoryMeta[] = [
  { id: "travel", label: "Travel", plural: "travel", blurb: "Destinations and the long way round." },
  { id: "city", label: "City", plural: "city", blurb: "Streets, alleys and skylines." },
  { id: "cafe", label: "Café", plural: "cafés", blurb: "Quiet corners and good light." },
  { id: "food", label: "Food", plural: "food", blurb: "Tables worth photographing." },
  { id: "getaway", label: "Getaway", plural: "getaways", blurb: "Weekends and short drives." },
] as const;

export const CATEGORY_BY_ID: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<Category, CategoryMeta>;
