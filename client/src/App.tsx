import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DocumentCollection from "@/pages/document-collection";
import DocumentCollectionDemo from "@/pages/document-collection-demo";
import NotFound from "@/pages/not-found";

function Router() {
  // Use demo version for Netlify deployment
  const isNetlifyDeploy = import.meta.env.PROD && !import.meta.env.VITE_API_URL;
  
  return (
    <Switch>
      <Route path="/" component={isNetlifyDeploy ? DocumentCollectionDemo : DocumentCollection} />
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
