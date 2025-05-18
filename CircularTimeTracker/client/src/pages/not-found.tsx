import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6 pb-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ページが見つかりません
            </h1>
          </div>

          <p className="mb-8 text-gray-600 dark:text-gray-400">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          
          <Link href="/">
            <Button>
              ホームに戻る
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
