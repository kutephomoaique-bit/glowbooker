import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Gallery from "@/pages/gallery";
import Feedback from "@/pages/feedback";
import Contact from "@/pages/contact";
import Account from "@/pages/account";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminBookings from "@/pages/admin/bookings";
import AdminGallery from "@/pages/admin/gallery";
import AdminFeedback from "@/pages/admin/feedback";
import AdminEvents from "@/pages/admin/events";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/services" component={Services} />
          <Route path="/booking" component={Booking} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/contact" component={Contact} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/booking" component={Booking} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/contact" component={Contact} />
          <Route path="/account" component={Account} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/services" component={AdminServices} />
          <Route path="/admin/bookings" component={AdminBookings} />
          <Route path="/admin/gallery" component={AdminGallery} />
          <Route path="/admin/feedback" component={AdminFeedback} />
          <Route path="/admin/events" component={AdminEvents} />
          <Route path="/admin/settings" component={AdminSettings} />
        </>
      )}
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
