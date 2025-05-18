import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto my-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">24時間タイムトラッカー</h1>
        <p className="text-lg text-muted-foreground">
          1日の活動を時計のような円形フォーマットで可視化し、時間の使い方を把握しましょう。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold mb-4">🕒 円形タイムライン</h2>
          <p className="mb-4">
            直感的な円形タイムラインで24時間の活動をひと目で把握。時間帯ごとの活動を簡単に追加・編集できます。
          </p>
          
          <h2 className="text-xl font-bold mb-4">🎨 カスタマイズ可能なカテゴリ</h2>
          <p className="mb-4">
            自分だけのカテゴリを作成し、色分けして管理。活動の種類ごとに時間を視覚的に分析できます。
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">📊 アクティビティサマリー</h2>
          <p className="mb-4">
            1日の活動を円グラフで集計。どのカテゴリに時間を費やしているかが一目瞭然です。
          </p>
          
          <h2 className="text-xl font-bold mb-4">🌓 ダークモード対応</h2>
          <p className="mb-4">
            目に優しいダークモードを搭載。お好みの表示モードでタイムトラッキングができます。
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
