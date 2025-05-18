import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "@/components/ui/toaster";

// UserProviderを再統合
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <App />
      <Toaster />
    </UserProvider>
  </QueryClientProvider>
);
