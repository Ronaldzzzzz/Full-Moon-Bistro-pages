import { describe, it, expect } from 'vitest';
import { getBaseMaterials } from './recipeUtils';
import type { MasterItem, MasterRecipe } from './recipeUtils';

describe('getBaseMaterials', () => {
  const mockItems: Record<number, MasterItem> = {
    1: { n: 'Item A', i: '', r: 101 },
    2: { n: 'Item B', i: '' },
    3: { n: 'Item C', i: '', r: 102 },
    4: { n: 'Item D', i: '' },
    5: { n: 'Item E', i: '' },
  };

  const mockRecipes: Record<number, MasterRecipe> = {
    101: {
      res: 1,
      ings: [
        { i: 2, a: 1 },
        { i: 3, a: 2 },
      ],
    },
    102: {
      res: 3,
      ings: [
        { i: 4, a: 1 },
        { i: 5, a: 3 },
      ],
    },
  };

  it('should correctly resolve base materials for a multi-level recipe', () => {
    // A = 1*B + 2*C
    // C = 1*D + 3*E
    // A = 1*B + 2*(1*D + 3*E) = 1*B + 2*D + 6*E
    const result = getBaseMaterials(1, mockItems, mockRecipes);
    expect(result).toEqual({
      2: 1,
      4: 2,
      5: 6,
    });
  });

  it('should return the item itself if it has no recipe', () => {
    const result = getBaseMaterials(2, mockItems, mockRecipes);
    expect(result).toEqual({ 2: 1 });
  });

  it('should handle multipliers correctly', () => {
    const result = getBaseMaterials(1, mockItems, mockRecipes, 2);
    expect(result).toEqual({
      2: 2,
      4: 4,
      5: 12,
    });
  });

  it('should handle circular dependencies gracefully', () => {
    const circularItems: Record<number, MasterItem> = {
      1: { n: 'A', i: '', r: 101 },
      2: { n: 'B', i: '', r: 102 },
    };
    const circularRecipes: Record<number, MasterRecipe> = {
      101: { res: 1, ings: [{ i: 2, a: 1 }] },
      102: { res: 2, ings: [{ i: 1, a: 1 }] },
    };
    
    // Should not infinite loop and return empty or partial result
    const result = getBaseMaterials(1, circularItems, circularRecipes);
    expect(result).toEqual({});
  });
});
