import { describe, it, expect } from 'vitest';
import { getBaseMaterials } from './recipeUtils';
import type { MasterItem, MasterRecipe } from './recipeUtils';

describe('getBaseMaterials', () => {
  const mockItems: Record<number, MasterItem> = {
    1: { n: '蘋果汁', i: '', r: 101 },
    2: { n: '蘋果', i: '' },
    3: { n: '砂糖', i: '', r: 102 },
    4: { n: '甜菜', i: '' },
  };

  const mockRecipes: Record<number, MasterRecipe> = {
    101: {
      res: 1,
      ings: [
        { i: 2, a: 3 }, // 3x 蘋果
        { i: 3, a: 1 }, // 1x 砂糖
      ],
    },
    102: {
      res: 3,
      ings: [
        { i: 4, a: 2 }, // 2x 甜菜
      ],
    },
  };

  it('應遞迴展開至最底層素材', () => {
    // 製作 1 份蘋果汁 應得 3 蘋果 + 2 甜菜
    const result = getBaseMaterials(1, 1, mockItems, mockRecipes);
    expect(result).toEqual({
      2: 3,
      4: 2,
    });
  });

  it('應正確計算多倍數量', () => {
    // 製作 2 份蘋果汁 應得 6 蘋果 + 4 甜菜
    const result = getBaseMaterials(1, 2, mockItems, mockRecipes);
    expect(result).toEqual({
      2: 6,
      4: 4,
    });
  });

  it('若無配方應直接回傳該物品', () => {
    const result = getBaseMaterials(2, 1, mockItems, mockRecipes);
    expect(result).toEqual({ 2: 1 });
  });

  it('應能處理循環依賴（保護機制）', () => {
    const circularItems: Record<number, MasterItem> = {
      1: { n: 'A', i: '', r: 1 },
      2: { n: 'B', i: '', r: 2 },
    };
    const circularRecipes: Record<number, MasterRecipe> = {
      1: { res: 1, ings: [{ i: 2, a: 1 }] },
      2: { res: 2, ings: [{ i: 1, a: 1 }] },
    };

    const result = getBaseMaterials(1, 1, circularItems, circularRecipes);
    // 雖然循環，但 Set 會阻止再次進入 1
    expect(result).toBeDefined();
  });
});
