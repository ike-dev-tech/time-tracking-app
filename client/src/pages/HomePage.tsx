import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">24時間タイムトラッカー</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          あなたの1日を円形タイムラインで可視化し、時間の使い方を最適化
        </p>
        <Button 
          size="lg" 
          onClick={() => setLocation("/auth")}
          className="text-lg px-6 py-6 h-auto"
        >
          今すぐ始める
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">🕒</div>
          <h2 className="text-2xl font-bold mb-3">円形タイムライン</h2>
          <p className="text-gray-600 dark:text-gray-300">
            直感的な円形タイムラインでは、24時間の活動を時計のように表示。時間帯ごとの活動を簡単に追加・編集できます。
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold mb-3">カスタマイズ可能なカテゴリ</h2>
          <p className="text-gray-600 dark:text-gray-300">
            自分だけのカテゴリを作成し、色分けして管理。活動の種類ごとに時間を視覚的に分析できます。
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">📊</div>
          <h2 className="text-2xl font-bold mb-3">アクティビティサマリー</h2>
          <p className="text-gray-600 dark:text-gray-300">
            1日の活動を円グラフで集計。どのカテゴリに時間を費やしているかが一目瞭然です。
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-3xl mb-4">🌓</div>
          <h2 className="text-2xl font-bold mb-3">ダークモード対応</h2>
          <p className="text-gray-600 dark:text-gray-300">
            目に優しいダークモードを搭載。お好みの表示モードでタイムトラッキングができます。
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">自分だけのタイムトラッキングを始めましょう</h2>
        <Button 
          onClick={() => setLocation("/auth")}
          className="mt-2"
        >
          ログイン / 登録
        </Button>
      </div>
    </div>
  );
}