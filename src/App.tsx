
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Pages
import Index from "./pages/Index";
import Home from "./pages/Home";
import RoomService from "./pages/RoomService";
import Spa from "./pages/Spa";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Wallet from "./pages/Wallet";
import TaxiBooking from "./pages/TaxiBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/room-service" element={<RoomService />} />
            <Route path="/spa" element={<Spa />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/taxi" element={<TaxiBooking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
