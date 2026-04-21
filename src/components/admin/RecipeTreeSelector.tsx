import type { RecipeTreeNode } from '../../lib/recipeUtils';

interface Props {
  node: RecipeTreeNode;
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  level?: number;
}

export default function RecipeTreeSelector({ node, selectedIds, onToggle, level = 0 }: Props) {
  const isSelected = selectedIds.has(node.id);

  // If level is 0, it's the root (the item itself). 
  // We might want to style it differently or just show its children.
  // The instruction says "每一項（含子項）前方都有一個 Checkbox"。

  return (
    <div className="flex flex-col gap-1">
      <div 
        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#3a2e18] transition-colors cursor-pointer group"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(node.id);
        }}
      >
        <div className="flex items-center justify-center w-4 h-4">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => {}} // Controlled by parent onClick
            className="accent-[#c9a55a] w-3.5 h-3.5 cursor-pointer"
          />
        </div>
        <span className={`text-xs transition-colors ${isSelected ? 'text-[#d4c090]' : 'text-[#6a5030] group-hover:text-[#9a8a70]'}`}>
          {node.name} <span className="text-[#9a8a70] ml-1 opacity-70">x{node.amount}</span>
        </span>
      </div>
      
      {node.ingredients && node.ingredients.length > 0 && (
        <div className="flex flex-col">
          {node.ingredients.map((child, index) => (
            <RecipeTreeSelector 
              key={`${node.id}-${child.id}-${index}`} 
              node={child} 
              selectedIds={selectedIds} 
              onToggle={onToggle} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
