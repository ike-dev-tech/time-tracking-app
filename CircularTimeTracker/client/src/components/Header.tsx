import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Clock, ChevronDown, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="p-4 bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary dark:text-primary">
          <Clock className="inline-block mr-2" />
          24時間タイムトラッカー
        </h1>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>{user.nickname}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>ログイン中</DropdownMenuLabel>
                <DropdownMenuLabel>{user.nickname}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}
