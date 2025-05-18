export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {currentYear} 24時間タイムトラッカー. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
