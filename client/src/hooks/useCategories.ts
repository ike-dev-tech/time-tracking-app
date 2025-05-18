import { useQuery, useMutation } from "@tanstack/react-query";
import { Category, InsertCategory, CategoryWithDuration } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCategories(userId: number) {
  const { toast } = useToast();

  // Fetch categories for a user
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: [`/api/users/${userId}/categories`],
    enabled: !!userId,
  });

  // Create a new category
  const createCategory = useMutation({
    mutationFn: async (category: Omit<InsertCategory, "userId">) => {
      const payload = { ...category, userId };
      const response = await apiRequest("POST", "/api/categories", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/categories`] });
      toast({
        title: "成功",
        description: "カテゴリが追加されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "カテゴリの追加に失敗しました",
        variant: "destructive",
      });
    },
  });

  // Update an existing category
  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: number; category: Partial<InsertCategory> }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/categories`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/summary`] });
      toast({
        title: "成功",
        description: "カテゴリが更新されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "カテゴリの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  // Delete a category
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/categories`] });
      toast({
        title: "成功",
        description: "カテゴリが削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "カテゴリの削除に失敗しました。このカテゴリは使用中の可能性があります。",
        variant: "destructive",
      });
    },
  });

  // Fetch activity summary by category
  const { data: summary, isLoading: isSummaryLoading } = useQuery<CategoryWithDuration[]>({
    queryKey: [`/api/users/${userId}/summary?date=${new Date().toISOString().split('T')[0]}`],
    enabled: !!userId,
  });

  return {
    categories: categories || [],
    summary: summary || [],
    isLoading,
    isSummaryLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
