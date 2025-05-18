import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { Link, Route, Switch } from "wouter";
import { Moon, Sun } from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";
import Dashboard from "@/pages/Dashboard";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function App() {
  const { user, logout } = useUser();
  const [darkMode, setDarkMode] = useState(false);
  
  // 初期ダークモード設定（システム設定とlocalStorageから）
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  // ダークモード切り替え
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // localStorageから直接ユーザー情報を取得
  const userFromStorage = (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("ローカルストレージからのユーザー取得エラー:", e);
      return null;
    }
  })();
  
  // 実際のログイン状態を判定
  const isLoggedIn = !!user || !!userFromStorage;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="text-2xl font-bold text-primary hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => window.location.href = "/"}
          >
            24時間タイムトラッカー
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              title={darkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {user ? user.nickname : userFromStorage.nickname}さん
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                >
                  ログアウト
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="py-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <p>© 2025 24時間タイムトラッカー</p>
      </footer>
    </div>
  );
}

export default App;
