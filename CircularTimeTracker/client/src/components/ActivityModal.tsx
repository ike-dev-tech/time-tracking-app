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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { 
  Activity, 
  ActivityWithCategory, 
  Category 
} from "@shared/schema";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityWithCategory | null;
  timeSlot: { start: number; end: number } | null;
  categories: Category[];
  onSave: (activity: Omit<Activity, "id" | "userId">) => void;
  onDelete: () => void;
}

// フォームのバリデーションスキーマ
const formSchema = z.object({
  categoryId: z.coerce.number().min(1, "カテゴリを選択してください"),
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  date: z.string(),
  notes: z.string().optional(),
  title: z.string().default("活動"), // タイトルはフォームに表示しないが、APIとの互換性のために残す
}).refine(data => data.startHour < data.endHour, {
  message: "終了時間は開始時間より後である必要があります",
  path: ["endHour"]
});

export default function ActivityModal({
  isOpen,
  onClose,
  activity,
  timeSlot,
  categories,
  onSave,
  onDelete
}: ActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 初期値を設定
  const defaultValues = activity 
    ? {
        categoryId: activity.categoryId,
        startHour: activity.startHour,
        endHour: activity.endHour,
        date: activity.date,
        notes: activity.notes || "",
        title: activity.title, // フォームには表示しないがAPIとの互換性のために保持
      }
    : {
        categoryId: categories.length > 0 ? categories[0].id : 0,
        startHour: timeSlot?.start || 0,
        endHour: timeSlot?.end || 1,
        date: new Date().toISOString().split('T')[0],
        notes: "",
        title: "活動", // デフォルトタイトル
      };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  // フォーム送信処理
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // NotesをnullにしてAPIとの型互換性を保つ
    const formattedValues = {
      ...values,
      notes: values.notes || null
    };
    
    onSave(formattedValues);
    setIsSubmitting(false);
    onClose();
  }
  
  // 削除処理
  const handleDelete = () => {
    if (!activity) return;
    
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
            {activity ? "アクティビティを編集" : "新しいアクティビティを追加"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* タイトル入力フィールドを削除 */}
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開始時間</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="開始時間" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {i}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>終了時間</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="終了時間" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i+1} value={String(i+1)}>
                            {i === 23 ? "24" : (i+1)}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ（任意）</FormLabel>
                  <FormControl>
                    <Input placeholder="メモやコメントなど" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div>
                {activity && (
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