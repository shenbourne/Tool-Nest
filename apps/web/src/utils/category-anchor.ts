// The home page renders one section per category (`<section id="category-<name>">`)
// and the sidebar links to those sections by hash. Both ends read the format from
// here so a link cannot point at a section that does not exist.

/** Gap kept between the viewport top and a category section, in px. */
export const CATEGORY_ANCHOR_OFFSET = 24;

export function categoryAnchorId(category: string): string {
  return `category-${category}`;
}

export function categoryAnchorHref(category: string): string {
  return `/#${categoryAnchorId(category)}`;
}
