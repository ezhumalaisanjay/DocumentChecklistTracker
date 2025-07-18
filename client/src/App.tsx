import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DocumentCollection from "@/pages/document-collection";
import DocumentCollectionDemo from "@/pages/document-collection-demo";
import NotFound from "@/pages/not-found";

function Router() {
  // Use demo version only when explicitly set
  // Since we now have full API functionality on Netlify, use the full version by default
  const useDemo = import.meta.env.VITE_USE_DEMO === 'true';
  
  return (
    <Switch>
      <Route path="/" component={useDemo ? DocumentCollectionDemo : DocumentCollection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
