import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function Account() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "My Account - Serenity Beauty Salon";
    
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["/api/my-bookings"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: contentSettings } = useQuery({
    queryKey: ["/api/content-settings"],
  });

  // Handle unauthorized error
  useEffect(() => {
    if (bookingsError && isUnauthorizedError(bookingsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [bookingsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const upcomingBookings = bookings.filter(
    (booking: any) => new Date(booking.dateTime) > new Date() && booking.status !== 'CANCELLED'
  );

  const pastBookings = bookings.filter(
    (booking: any) => new Date(booking.dateTime) <= new Date() || booking.status === 'DONE'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DONE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'DONE':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="account-title">
              My Account
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="account-description">
              Welcome back, {user?.firstName || 'Beautiful'}!
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="profile" className="w-full" data-testid="account-tabs">
            <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="tabs-list">
              <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" data-testid="tab-content-profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card data-testid="profile-info-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>Profile Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div data-testid="profile-name">
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-foreground" data-testid="text-full-name">
                        {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not provided'}
                      </p>
                    </div>
                    <div data-testid="profile-email">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-foreground" data-testid="text-email">
                        {user?.email || 'Not provided'}
                      </p>
                    </div>
                    <div data-testid="profile-phone">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-foreground" data-testid="text-phone">
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div data-testid="profile-role">
                      <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                      <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} data-testid="badge-role">
                        {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="account-stats-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-primary" />
                      <span>Account Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="stat-total-bookings">
                        <p className="text-2xl font-bold text-primary" data-testid="text-total-bookings">
                          {bookings.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="stat-upcoming-bookings">
                        <p className="text-2xl font-bold text-accent" data-testid="text-upcoming-bookings">
                          {upcomingBookings.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg" data-testid="stat-member-since">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold text-foreground" data-testid="text-member-since">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        }) : 'Recently'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Upcoming Bookings Tab */}
            <TabsContent value="upcoming" data-testid="tab-content-upcoming">
              <Card data-testid="upcoming-bookings-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Upcoming Appointments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-4" data-testid="upcoming-bookings-list">
                      {upcomingBookings.map((booking: any) => (
                        <div 
                          key={booking.id} 
                          className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                          data-testid={`upcoming-booking-${booking.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-foreground" data-testid={`service-name-${booking.id}`}>
                                  {booking.service.name}
                                </h3>
                                <Badge className={getStatusColor(booking.status)} data-testid={`status-${booking.id}`}>
                                  <span className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status}</span>
                                  </span>
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1" data-testid={`date-${booking.id}`}>
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.dateTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1" data-testid={`time-${booking.id}`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center space-x-1" data-testid={`duration-${booking.id}`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.durationMins} mins</span>
                                </div>
                              </div>
                              {booking.staff && (
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`staff-${booking.id}`}>
                                  with {booking.staff.name}
                                </p>
                              )}
                              {booking.notes && (
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`notes-${booking.id}`}>
                                  Note: {booking.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary" data-testid={`price-${booking.id}`}>
                                ${parseFloat(booking.totalPrice || booking.service.basePrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4" data-testid="text-no-upcoming">
                        No upcoming appointments
                      </p>
                      <Button asChild data-testid="button-book-appointment">
                        <a href="/booking">Book Your Next Appointment</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Booking History Tab */}
            <TabsContent value="history" data-testid="tab-content-history">
              <Card data-testid="booking-history-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Booking History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : pastBookings.length > 0 ? (
                    <div className="space-y-4" data-testid="booking-history-list">
                      {pastBookings.map((booking: any) => (
                        <div 
                          key={booking.id} 
                          className="p-4 border rounded-lg"
                          data-testid={`history-booking-${booking.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-foreground" data-testid={`history-service-name-${booking.id}`}>
                                  {booking.service.name}
                                </h3>
                                <Badge className={getStatusColor(booking.status)} data-testid={`history-status-${booking.id}`}>
                                  <span className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status}</span>
                                  </span>
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1" data-testid={`history-date-${booking.id}`}>
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.dateTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1" data-testid={`history-time-${booking.id}`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center space-x-1" data-testid={`history-duration-${booking.id}`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.durationMins} mins</span>
                                </div>
                              </div>
                              {booking.staff && (
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`history-staff-${booking.id}`}>
                                  with {booking.staff.name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground" data-testid={`history-price-${booking.id}`}>
                                ${parseFloat(booking.totalPrice || booking.service.basePrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="text-no-history">
                        No booking history yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer contentSettings={contentSettings} />
    </div>
  );
}
