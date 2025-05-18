import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  // ユーザーがログイン済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">24時間タイムトラッカー</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            1日の活動を時計のような円形フォーマットで可視化し、時間の使い方を把握しましょう。
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">🕒 円形タイムライン</h3>
              <p className="text-gray-600 dark:text-gray-300">
                直感的な円形タイムラインで24時間の活動をひと目で把握。時間帯ごとの活動を簡単に追加・編集できます。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">🎨 カスタマイズ可能なカテゴリ</h3>
              <p className="text-gray-600 dark:text-gray-300">
                自分だけのカテゴリを作成し、色分けして管理。活動の種類ごとに時間を視覚的に分析できます。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">📊 アクティビティサマリー</h3>
              <p className="text-gray-600 dark:text-gray-300">
                1日の活動を円グラフで集計。どのカテゴリに時間を費やしているかが一目瞭然です。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">🌓 ダークモード対応</h3>
              <p className="text-gray-600 dark:text-gray-300">
                目に優しいダークモードを搭載。お好みの表示モードでタイムトラッキングができます。
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}