import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "./pages/not-found";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Services from "./pages/services";
import Booking from "./pages/booking";
import Gallery from "./pages/gallery";
import Feedback from "./pages/feedback";
import Contact from "./pages/contact";
import Account from "./pages/account";
import AdminDashboard from "./pages/admin/dashboard";
import AdminServices from "./pages/admin/services";
import AdminBookings from "./pages/admin/bookings";
import AdminStaff from "./pages/admin/staff";
import AdminGallery from "./pages/admin/gallery";
import AdminFeedback from "./pages/admin/feedback";
import AdminEvents from "./pages/admin/events";
import AdminSettings from "./pages/admin/settings";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public routes available to everyone */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={Landing} />
      <Route path="/services" component={Services} />
      <Route path="/booking" component={Booking} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/contact" component={Contact} />
      
      {/* Protected routes for authenticated users */}
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/home" component={Home} />
      
      {/* Admin routes - protected and require ADMIN role */}
      <Route path="/admin">
        {user?.role === 'ADMIN' ? <AdminDashboard /> : <NotFound />}
      </Route>
      <Route path="/admin/services">
        {user?.role === 'ADMIN' ? <AdminServices /> : <NotFound />}
      </Route>
      <Route path="/admin/bookings">
        {user?.role === 'ADMIN' ? <AdminBookings /> : <NotFound />}
      </Route>
      <Route path="/admin/staff">
        {user?.role === 'ADMIN' ? <AdminStaff /> : <NotFound />}
      </Route>
      <Route path="/admin/gallery">
        {user?.role === 'ADMIN' ? <AdminGallery /> : <NotFound />}
      </Route>
      <Route path="/admin/feedback">
        {user?.role === 'ADMIN' ? <AdminFeedback /> : <NotFound />}
      </Route>
      <Route path="/admin/events">
        {user?.role === 'ADMIN' ? <AdminEvents /> : <NotFound />}
      </Route>
      <Route path="/admin/settings">
        {user?.role === 'ADMIN' ? <AdminSettings /> : <NotFound />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
