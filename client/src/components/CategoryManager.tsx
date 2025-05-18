import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus } from "lucide-react";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryManagerProps {
  categories: Category[];
  onCategoryClick: (id: number) => void;
  onAddCategory: () => void;
}

export default function CategoryManager({ 
  categories, 
  onCategoryClick, 
  onAddCategory 
}: CategoryManagerProps) {
  if (!categories.length) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Button 
          variant="outline" 
          className="w-full mt-4 border-dashed"
          onClick={onAddCategory}
        >
          <Plus className="h-4 w-4 mr-2" />
          新しいカテゴリを追加
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: category.color }}
            />
            <span>{category.name}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onCategoryClick(category.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full mt-4 border-dashed"
        onClick={onAddCategory}
      >
        <Plus className="h-4 w-4 mr-2" />
        新しいカテゴリを追加
      </Button>
    </div>
  );
}
