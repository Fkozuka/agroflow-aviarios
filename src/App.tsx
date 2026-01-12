
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Producao from "./pages/Producao";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Grupo from "./pages/grupo";
import HomeSecador from "./pages/pagesSecador/homeSecador";
import PainelSecador from "./pages/pagesSecador/painelSecador";
import { AuthProvider } from "./hooks/use-auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/producao" 
              element={
                <ProtectedRoute>
                  <Producao />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grupo" 
              element={
                <ProtectedRoute>
                  <Grupo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/secadores" 
              element={
                <ProtectedRoute>
                  <HomeSecador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/secador/:secadorId" 
              element={
                <ProtectedRoute>
                  <PainelSecador />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
