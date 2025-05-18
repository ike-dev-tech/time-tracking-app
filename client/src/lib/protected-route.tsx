import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  // localStorageからユーザー情報を直接取得
  const userFromStorage = (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Protected Route: ローカルストレージからのユーザー取得エラー:", e);
      return null;
    }
  })();

  const isAuthenticated = !!user || !!userFromStorage;

  // ロード中はローディングインジケータを表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 未認証の場合はホームページにリダイレクト
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  // 認証されている場合は子コンポーネントを表示
  return <>{children}</>;
}