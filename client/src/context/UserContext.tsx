import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

// シンプルなUserContextの作成
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (nickname: string) => Promise<User | null>;
  logout: () => void;
}

// デフォルト値を持つコンテキストを作成
const defaultContext: UserContextType = {
  user: null,
  isLoading: false,
  login: async () => null,
  logout: () => {}
};

const UserContext = createContext<UserContextType>(defaultContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ページロード時にlocalStorageからユーザー情報を取得
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      console.log("localStorageからユーザー取得中:", savedUser);
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log("ユーザー情報をロード:", userData);
        setUser(userData);
      }
    } catch (e) {
      console.error("localStorageの読み込みエラー:", e);
      localStorage.removeItem("user");
    }
  }, []);

  // ログイン処理 - 既存ユーザーの検索と新規作成を両方サポート
  const login = async (nickname: string) => {
    if (!nickname || nickname.trim().length < 2) {
      toast({
        title: "エラー",
        description: "ニックネームは2文字以上必要です",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      let userData;
      
      // ユーザー作成APIをリンク確認のため直接呼び出し
      console.log("ユーザー作成API呼び出し中...");
      
      // ユーザー作成を試みる
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname }),
      });
      
      console.log(`APIレスポンス: ${createResponse.status} ${createResponse.statusText}`);
      
      if (createResponse.status === 201) {
        // 作成成功
        userData = await createResponse.json();
        console.log("新規ユーザーを作成しました:", userData);
      } else if (createResponse.status === 409) {
        // 既に存在する場合は取得を試みる
        console.log("ユーザーが既に存在します。取得を試みます...");
        const searchResponse = await fetch(`/api/users/${encodeURIComponent(nickname)}`);
        
        if (searchResponse.ok) {
          userData = await searchResponse.json();
          console.log("既存ユーザーを取得しました:", userData);
        } else {
          console.error("既存ユーザーの取得に失敗:", searchResponse.status);
          toast({
            title: "エラー",
            description: "ユーザー情報の取得に失敗しました。",
            variant: "destructive",
          });
          return null;
        }
      } else {
        // その他のエラー
        try {
          const errorData = await createResponse.json();
          console.error("API処理エラー:", errorData);
          toast({
            title: "エラー",
            description: errorData.message || "不明なエラーが発生しました",
            variant: "destructive",
          });
        } catch (e) {
          console.error("APIエラーの解析に失敗:", e);
          toast({
            title: "エラー",
            description: "サーバー通信中にエラーが発生しました",
            variant: "destructive",
          });
        }
        return null;
      }
      
      if (userData) {
        // ユーザーデータを更新
        console.log("ユーザー状態を更新:", userData);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast({
          title: "ログイン成功",
          description: `${nickname}さん、ようこそ！`,
        });
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error("ログイン中の例外:", error);
      toast({
        title: "エラー",
        description: `サーバーとの通信に失敗しました: ${(error as Error).message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "ログアウト",
      description: "ログアウトしました",
    });
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 関数をconst宣言に変更してHMR対応にする
export const useUser = () => {
  return useContext(UserContext);
};
