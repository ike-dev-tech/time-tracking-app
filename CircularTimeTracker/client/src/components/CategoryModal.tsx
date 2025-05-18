import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { 
  Category 
} from "@shared/schema";
import { defaultCategoryColors } from "@/lib/colors";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number | null;
  categories: Category[];
  onSave: (category: Omit<Category, "id" | "userId">) => void;
  onDelete: () => void;
}

// フォームのバリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, "カテゴリ名は必須です").max(50, "50文字以内で入力してください"),
  color: z.string().min(1, "カラーは必須です"),
  description: z.string().optional(),
});

export default function CategoryModal({
  isOpen,
  onClose,
  categoryId,
  categories,
  onSave,
  onDelete
}: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 編集対象のカテゴリを探す
  const category = categoryId ? categories.find(c => c.id === categoryId) : null;
  
  // カラーピッカー用の選択肢
  const colorOptions = defaultCategoryColors;
  
  // 初期値を設定
  const defaultValues = category 
    ? {
        name: category.name,
        color: category.color,
        description: category.description || ""
      }
    : {
        name: "",
        color: colorOptions[0],
        description: ""
      };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // フォーム送信処理
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // descriptionをnullにしてAPIとの型互換性を保つ
    const formattedValues = {
      ...values,
      description: values.description || null
    };
    
    onSave(formattedValues);
    setIsSubmitting(false);
    onClose();
  }
  
  // 削除処理
  const handleDelete = () => {
    if (!categoryId) return;
    
    setIsDeleting(true);
    onDelete();
    setIsDeleting(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "カテゴリを編集" : "新しいカテゴリを追加"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ名</FormLabel>
                  <FormControl>
                    <Input placeholder="例：仕事、睡眠、運動など" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カラー</FormLabel>
                  <div className="grid grid-cols-8 gap-2">
                    {colorOptions.map(color => (
                      <div
                        key={color}
                        className={`
                          w-8 h-8 rounded-full cursor-pointer border-2
                          ${field.value === color ? 'border-primary' : 'border-transparent'}
                          hover:opacity-80 transition-opacity
                        `}
                        style={{ backgroundColor: color }}
                        onClick={() => form.setValue("color", color)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（任意）</FormLabel>
                  <FormControl>
                    <Input placeholder="カテゴリの説明" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div>
                {category && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        削除中...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : "保存"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}