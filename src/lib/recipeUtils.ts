export interface MasterItem {
  n: string; // name
  i: string; // icon path
  r?: number; // recipeId
}

export interface MasterRecipe {
  res: number; // result item id
  ings: { i: number; a: number }[]; // ingredients (id, amount)
}

/**
 * 遞迴計算製作一個目標物品所需的最底層原始素材數量。
 * 
 * @param itemId 目標物品 ID
 * @param amount 需求數量
 * @param items 物品主資料
 * @param recipes 配方主資料
 * @param result 累加結果 (itemId -> amount)
 * @param visited 用於防範循環依賴
 */
export function getBaseMaterials(
  itemId: number,
  amount: number,
  items: Record<number, MasterItem>,
  recipes: Record<number, MasterRecipe>,
  result: Record<number, number> = {},
  visited: Set<number> = new Set()
): Record<number, number> {
  // 防範循環依賴 (FFXIV 雖少見，但為求嚴謹)
  if (visited.has(itemId)) return result;
  
  const item = items[itemId];
  if (!item) return result;

  // 如果該物品有配方，則繼續向下拆解其成分
  if (item.r && recipes[item.r]) {
    visited.add(itemId);
    const recipe = recipes[item.r];
    for (const ing of recipe.ings) {
      getBaseMaterials(ing.i, ing.a * amount, items, recipes, result, visited);
    }
    visited.delete(itemId);
  } else {
    // 該物品已無配方，視為最底層素材，記錄其總需求數量
    result[itemId] = (result[itemId] || 0) + amount;
  }

  return result;
}
