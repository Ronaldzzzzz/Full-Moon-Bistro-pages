export interface MasterItem {
  n: string; // name
  i: string; // icon
  r?: number; // recipeId
}

export interface MasterRecipe {
  res: number; // resultItemId
  ings: {
    i: number; // itemId
    a: number; // amount
  }[];
}

/**
 * Recursively resolves an item into its base materials.
 * Base materials are items that do not have a recipe associated with them.
 */
export function getBaseMaterials(
  itemId: number,
  masterItems: Record<number, MasterItem>,
  masterRecipes: Record<number, MasterRecipe>,
  multiplier: number = 1,
  visited: Set<number> = new Set()
): Record<number, number> {
  const result: Record<number, number> = {};

  // Circular dependency protection
  if (visited.has(itemId)) {
    return result;
  }
  visited.add(itemId);

  const item = masterItems[itemId];
  if (!item || !item.r) {
    // Base material
    result[itemId] = multiplier;
    visited.delete(itemId); // Allow same material in different branches
    return result;
  }

  const recipe = masterRecipes[item.r];
  if (!recipe) {
    // Recipe ID exists but recipe data is missing, treat as base
    result[itemId] = multiplier;
    visited.delete(itemId);
    return result;
  }

  for (const ing of recipe.ings) {
    const materials = getBaseMaterials(
      ing.i,
      masterItems,
      masterRecipes,
      ing.a * multiplier,
      visited
    );

    for (const [mId, mAmount] of Object.entries(materials)) {
      const id = Number(mId);
      result[id] = (result[id] || 0) + mAmount;
    }
  }

  visited.delete(itemId);
  return result;
}
