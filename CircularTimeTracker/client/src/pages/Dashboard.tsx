import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Loader2, Clock, Plus, Settings } from "lucide-react";
import ClockFace from "@/components/ClockFace";
import ActivityModal from "@/components/ActivityModal";
import CategoryModal from "@/components/CategoryModal";
import { ActivityWithCategory, Category, InsertActivity, InsertCategory } from "@shared/schema";

// 一時的に簡略化したダッシュボード - 無限ループを防止
export default function Dashboard() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  
  // 現在の日付（デフォルトは今日）
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 状態管理
  const [activities, setActivities] = useState<ActivityWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // モーダル関連の状態
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: number; end: number } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithCategory | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // localStorage からもユーザー情報を取得する
  const userFromStorage = (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("ローカルストレージからのユーザー取得エラー:", e);
      return null;
    }
  })();
  
  // 実際に使用するユーザー情報
  const actualUser = user || userFromStorage;
  
  // データ読み込み - マウント時のみ一度だけ実行
  useEffect(() => {
    // ユーザーが存在しない場合は何もしない
    if (!actualUser) return;
    
    let isMounted = true;
    
    console.log("データ読み込みを開始します - ユーザーID:", actualUser.id);
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // カテゴリを取得
        const categoriesResponse = await fetch(`/api/users/${actualUser.id}/categories`);
        if (!isMounted) return;
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (!isMounted) return;
          
          console.log(`${categoriesData.length}件のカテゴリを取得しました`);
          setCategories(categoriesData);
        } else {
          console.error("カテゴリ取得エラー:", categoriesResponse.status);
          setError("カテゴリの取得に失敗しました");
        }
        
        // アクティビティを取得
        const activitiesResponse = await fetch(`/api/users/${actualUser.id}/activities?date=${currentDate}`);
        if (!isMounted) return;
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          if (!isMounted) return;
          
          console.log(`${activitiesData.length}件のアクティビティを取得しました`);
          setActivities(activitiesData);
        } else {
          console.error("アクティビティ取得エラー:", activitiesResponse.status);
          setError("アクティビティの取得に失敗しました");
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error("データ取得エラー:", error);
        setError("データの取得中にエラーが発生しました");
        
        toast({
          title: "読み込みエラー",
          description: "データの取得中にエラーが発生しました",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, []);
  
  // ログアウト処理
  const handleLogout = () => {
    console.log("ログアウト処理開始");
    logout();
    localStorage.removeItem("user");
    toast({
      title: "ログアウトしました",
      description: "またのご利用をお待ちしています",
    });
    
    // ページをリロード（ホーム表示のため）
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  // ユーザーがログインしていない場合
  if (!actualUser) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-center">ログインが必要です。</p>
      </div>
    );
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-red-500 font-bold text-center">{error}</p>
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          今日の活動 <span className="text-gray-500">({formatDate(currentDate)})</span>
        </h2>
        <Button variant="outline" onClick={handleLogout}>ログアウト</Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">アクティビティタイムライン</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setSelectedActivity(null);
                  setSelectedTimeSlot({ start: now.getHours(), end: now.getHours() + 1 });
                  setIsActivityModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                活動を追加
              </Button>
            </div>
            
            {activities.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 h-80 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>まだ活動がありません</p>
                  <p className="text-sm text-gray-500">タイムラインをクリックして活動を追加しましょう</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ClockFace 
                  activities={activities}
                  onTimeSlotClick={(start: number, end: number) => {
                    console.log(`時間枠がクリックされました: ${start}:00-${end}:00`);
                    setSelectedTimeSlot({ start, end });
                    setIsActivityModalOpen(true);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">カテゴリ</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setIsCategoryModalOpen(true);
                }}
              >
                <Settings className="h-4 w-4 mr-1" />
                管理
              </Button>
            </div>
            
            {categories.length === 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                <p>カテゴリがありません</p>
                <p className="text-sm text-gray-500">新しいカテゴリを追加しましょう</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setIsCategoryModalOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {activities.filter(a => a.categoryId === category.id).reduce((sum, a) => sum + (a.endHour - a.startHour), 0)}時間
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                カテゴリを追加
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* アクティビティモーダル */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(null);
          setSelectedTimeSlot(null);
        }}
        activity={selectedActivity}
        timeSlot={selectedTimeSlot}
        categories={categories}
        onSave={async (activityData) => {
          if (!actualUser) return;
          
          try {
            const requestData = {
              ...activityData,
              userId: actualUser.id,
            };
            
            if (selectedActivity) {
              // 更新
              const response = await fetch(`/api/activities/${selectedActivity.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });
              
              if (response.ok) {
                const updatedActivity = await response.json();
                setActivities(activities.map(a => 
                  a.id === selectedActivity.id 
                    ? { ...updatedActivity, category: categories.find(c => c.id === updatedActivity.categoryId)! } 
                    : a
                ));
                toast({ title: "活動を更新しました" });
              }
            } else {
              // 新規作成
              const response = await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });
              
              if (response.ok) {
                const newActivity = await response.json();
                const category = categories.find(c => c.id === newActivity.categoryId)!;
                setActivities([...activities, { ...newActivity, category }]);
                toast({ title: "活動を追加しました" });
              }
            }
          } catch (error) {
            console.error("アクティビティ保存エラー:", error);
            toast({
              title: "保存エラー",
              description: "活動の保存中にエラーが発生しました",
              variant: "destructive",
            });
          }
        }}
        onDelete={async () => {
          if (!selectedActivity) return;
          
          try {
            const response = await fetch(`/api/activities/${selectedActivity.id}`, {
              method: "DELETE",
            });
            
            if (response.ok) {
              setActivities(activities.filter(a => a.id !== selectedActivity.id));
              toast({ title: "活動を削除しました" });
            }
          } catch (error) {
            console.error("アクティビティ削除エラー:", error);
            toast({
              title: "削除エラー",
              description: "活動の削除中にエラーが発生しました",
              variant: "destructive",
            });
          }
        }}
      />
      
      {/* カテゴリモーダル */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategoryId(null);
        }}
        categoryId={selectedCategoryId}
        categories={categories}
        onSave={async (categoryData) => {
          if (!actualUser) return;
          
          try {
            const requestData = {
              ...categoryData,
              userId: actualUser.id,
            };
            
            if (selectedCategoryId) {
              // 更新
              const response = await fetch(`/api/categories/${selectedCategoryId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });
              
              if (response.ok) {
                const updatedCategory = await response.json();
                setCategories(categories.map(c => c.id === selectedCategoryId ? updatedCategory : c));
                
                // アクティビティの表示も更新
                setActivities(activities.map(a => 
                  a.categoryId === selectedCategoryId 
                    ? { ...a, category: updatedCategory } 
                    : a
                ));
                
                toast({ title: "カテゴリを更新しました" });
              }
            } else {
              // 新規作成
              const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
              });
              
              if (response.ok) {
                const newCategory = await response.json();
                setCategories([...categories, newCategory]);
                toast({ title: "カテゴリを追加しました" });
              }
            }
          } catch (error) {
            console.error("カテゴリ保存エラー:", error);
            toast({
              title: "保存エラー",
              description: "カテゴリの保存中にエラーが発生しました",
              variant: "destructive",
            });
          }
        }}
        onDelete={async () => {
          if (!selectedCategoryId) return;
          
          try {
            const response = await fetch(`/api/categories/${selectedCategoryId}`, {
              method: "DELETE",
            });
            
            if (response.ok) {
              setCategories(categories.filter(c => c.id !== selectedCategoryId));
              toast({ title: "カテゴリを削除しました" });
            } else {
              const errorData = await response.json();
              toast({
                title: "削除エラー",
                description: errorData.message || "カテゴリの削除中にエラーが発生しました",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("カテゴリ削除エラー:", error);
            toast({
              title: "削除エラー",
              description: "カテゴリの削除中にエラーが発生しました",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}