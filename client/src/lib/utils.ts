import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付をフォーマットする関数 (YYYY-MM-DD → YYYY年MM月DD日)
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
