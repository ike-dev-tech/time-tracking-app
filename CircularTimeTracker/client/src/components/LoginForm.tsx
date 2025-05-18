import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// バリデーションスキーマ
const loginSchema = z.object({
  nickname: z
    .string()
    .min(2, {
      message: "ニックネームは2文字以上である必要があります",
    })
    .max(30, {
      message: "ニックネームは30文字以下である必要があります",
    }),
});

export default function LoginForm() {
  const { login, isLoading } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nickname: "",
    },
  });

  // デバッグ用の情報を表示
  useEffect(() => {
    const checkEndpoint = async () => {
      try {
        const testUser = "test-debug";
        const response = await fetch(`/api/users/${encodeURIComponent(testUser)}`);
        setDebugInfo(`API Check: ${response.status} ${response.statusText}`);
      } catch (err) {
        setDebugInfo(`API Error: ${(err as Error).message}`);
      }
    };
    
    checkEndpoint();
  }, []);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log("フォーム送信:", values);
    setError(null);
    setDebugInfo(null);
    
    try {
      setDebugInfo("ログイン関数を実行中...");
      
      // 直接APIを呼び出してデバッグ
      try {
        // まず既存ユーザーが存在するかチェック
        const checkUserResponse = await fetch(`/api/users/${encodeURIComponent(values.nickname)}`);
        
        if (checkUserResponse.ok) {
          // 既存ユーザーが見つかった場合
          const userDataText = await checkUserResponse.text();
          setDebugInfo(`既存ユーザー検索結果: ${checkUserResponse.status}, レスポンス: ${userDataText}`);
          
          try {
            // ユーザーデータをlocalStorageに保存
            localStorage.setItem("user", userDataText);
            const userData = JSON.parse(userDataText);
            setDebugInfo(`既存ユーザーデータ取得成功: ${JSON.stringify(userData)}`);
            
            // ダッシュボードにリダイレクト
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 800);
            
            return;
          } catch (parseErr) {
            setDebugInfo(`JSONパースエラー: ${(parseErr as Error).message}`);
          }
        } else {
          // 既存ユーザーが見つからない場合は新規作成
          setDebugInfo(`既存ユーザーなし: ${checkUserResponse.status}、新規作成試行中...`);
          
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname: values.nickname }),
          });
          
          const responseText = await createResponse.text();
          setDebugInfo(`ユーザー作成API結果: ${createResponse.status}, レスポンス: ${responseText}`);
          
          if (createResponse.ok) {
            try {
              // ユーザーデータを取得して更新
              localStorage.setItem("user", responseText);
              const userData = JSON.parse(responseText);
              setDebugInfo(`ユーザーデータ作成成功: ${JSON.stringify(userData)}`);
              
              // ダッシュボードにリダイレクト
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 800);
              
              return;
            } catch (parseErr) {
              setDebugInfo(`JSONパースエラー: ${(parseErr as Error).message}`);
            }
          } else if (createResponse.status === 409) {
            // 既存ユーザーエラーの場合は再度検索
            setDebugInfo('ユーザーが既存です。再検索中...');
            const retryResponse = await fetch(`/api/users/${encodeURIComponent(values.nickname)}`);
            
            if (retryResponse.ok) {
              const retryDataText = await retryResponse.text();
              try {
                localStorage.setItem("user", retryDataText);
                const userData = JSON.parse(retryDataText);
                setDebugInfo(`既存ユーザー取得成功: ${JSON.stringify(userData)}`);
                
                setTimeout(() => {
                  window.location.href = "/dashboard";
                }, 800);
                
                return;
              } catch (retryErr) {
                setDebugInfo(`再試行時のエラー: ${(retryErr as Error).message}`);
              }
            }
          }
        }
      } catch (apiErr) {
        setDebugInfo(`API直接呼び出しエラー: ${(apiErr as Error).message}`);
      }
      
      // 通常のログインフローを続行（上記が失敗した場合）
      const userData = await login(values.nickname);
      
      setDebugInfo(userData ? "ユーザーデータ取得成功" : "ユーザーデータなし");
      
      if (userData) {
        // ログイン完了
        console.log("ログイン完了");
        setDebugInfo("ログイン完了、リダイレクト準備中...");
        
        // ダッシュボードにリダイレクト
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (err) {
      console.error("例外が発生しました:", err);
      setError("サーバーとの通信に失敗しました。");
      setDebugInfo(`エラー発生: ${(err as Error).message}`);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">ニックネームを入力</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        あなただけのタイムトラッキングページを作成します。
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <div className="mb-4 text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded border">
          <p className="font-mono">{debugInfo}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ニックネーム</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ニックネームを入力してください" 
                    {...field} 
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                読み込み中
              </>
            ) : (
              "始める"
            )}
          </Button>
          
          <div className="text-xs text-center mt-4 text-gray-500">
            ※「テスト」などの一般的なニックネームは既に使用されている場合があります。
            その場合は別のニックネームをお試しください。
          </div>
        </form>
      </Form>
    </div>
  );
}
