import { useQuery, useMutation } from "@tanstack/react-query";
import { ActivityWithCategory, InsertActivity, Activity } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useActivities(userId: number, date: string) {
  const { toast } = useToast();

  // Fetch activities for a user on a specific date
  const { data: activities, isLoading, error } = useQuery<ActivityWithCategory[]>({
    queryKey: [`/api/users/${userId}/activities?date=${date}`],
    enabled: !!userId,
  });

  // Create a new activity
  const createActivity = useMutation({
    mutationFn: async (activity: Omit<InsertActivity, "userId">) => {
      const payload = { ...activity, userId };
      const response = await apiRequest("POST", "/api/activities", payload);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch activities
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/summary`] });
      toast({
        title: "成功",
        description: "活動が追加されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "活動の追加に失敗しました",
        variant: "destructive",
      });
    },
  });

  // Update an existing activity
  const updateActivity = useMutation({
    mutationFn: async ({ id, activity }: { id: number; activity: Partial<InsertActivity> }) => {
      const response = await apiRequest("PUT", `/api/activities/${id}`, activity);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/summary`] });
      toast({
        title: "成功",
        description: "活動が更新されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "活動の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  // Delete an activity
  const deleteActivity = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/summary`] });
      toast({
        title: "成功",
        description: "活動が削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "活動の削除に失敗しました",
        variant: "destructive",
      });
    },
  });

  return {
    activities: activities || [],
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
