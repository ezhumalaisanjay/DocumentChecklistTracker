import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DocumentCollection from "@/pages/document-collection";
import DocumentCollectionDemo from "@/pages/document-collection-demo";
import NotFound from "@/pages/not-found";

function Router() {
  // Use demo version for Netlify deployment or when explicitly set
  const isNetlifyDeploy = import.meta.env.PROD && !import.meta.env.VITE_API_URL;
  const useDemo = import.meta.env.VITE_USE_DEMO === 'true' || isNetlifyDeploy;
  
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
