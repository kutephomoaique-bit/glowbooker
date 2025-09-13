import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Admin Dashboard - HOME BASE Beauty Salon";
    
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: bookings = [], error: bookingsError } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  const { data: pendingFeedback = [], error: feedbackError } = useQuery({
    queryKey: ["/api/admin/feedback/pending"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [bookingsError, feedbackError].filter(Boolean);
    for (const error of errors) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Admin session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    }
  }, [bookingsError, feedbackError, toast]);

  if (isLoading || (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Calculate statistics
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisWeekBookings = bookings.filter((booking: any) => 
    new Date(booking.createdAt) >= thisWeekStart
  );

  const upcomingBookings = bookings.filter((booking: any) => 
    new Date(booking.dateTime) > new Date() && booking.status !== 'CANCELLED'
  );

  const totalRevenue = bookings
    .filter((booking: any) => booking.status === 'DONE')
    .reduce((sum: number, booking: any) => sum + parseFloat(booking.totalPrice || 0), 0);

  const monthlyRevenue = bookings
    .filter((booking: any) => {
      const bookingDate = new Date(booking.dateTime);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return booking.status === 'DONE' && 
             bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear;
    })
    .reduce((sum: number, booking: any) => sum + parseFloat(booking.totalPrice || 0), 0);

  const recentBookings = bookings
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="dashboard-title">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground" data-testid="dashboard-description">
            Welcome back, {user?.firstName}! Here's what's happening at your salon.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-weekly-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="weekly-bookings-count">
                {thisWeekBookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                New appointments this week
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-customers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-customers-count">
                {new Set(bookings.map((b: any) => b.userId || b.customerEmail)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique customers served
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-monthly-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="monthly-revenue-amount">
                ${monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue this month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-reviews">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="pending-reviews-count">
                {pendingFeedback.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card data-testid="recent-bookings-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Bookings</span>
                <Link href="/admin/bookings">
                  <Button variant="outline" size="sm" data-testid="button-view-all-bookings">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="recent-bookings-list">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      data-testid={`recent-booking-${booking.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground" data-testid={`booking-customer-${booking.id}`}>
                          {booking.customerName || booking.user?.firstName || 'Guest'}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`booking-service-${booking.id}`}>
                          {booking.service.name} • {new Date(booking.dateTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)} data-testid={`booking-status-${booking.id}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-recent-bookings">
                    No recent bookings
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card data-testid="pending-reviews-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Reviews</span>
                <Link href="/admin/feedback">
                  <Button variant="outline" size="sm" data-testid="button-view-all-feedback">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="pending-reviews-list">
                {pendingFeedback.length > 0 ? (
                  pendingFeedback.slice(0, 3).map((feedback: any) => (
                    <div 
                      key={feedback.id} 
                      className="p-3 bg-muted/30 rounded-lg"
                      data-testid={`pending-review-${feedback.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground" data-testid={`review-customer-${feedback.id}`}>
                          {feedback.customerName || feedback.user?.firstName || 'Anonymous'}
                        </p>
                        <div className="flex text-accent text-sm" data-testid={`review-rating-${feedback.id}`}>
                          {Array.from({ length: feedback.rating }, (_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`review-comment-${feedback.id}`}>
                        "{feedback.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-pending-reviews">
                    No pending reviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="quick-actions-grid">
              <Link href="/admin/services">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2" data-testid="button-manage-services">
                  <TrendingUp className="w-5 h-5" />
                  <span>Manage Services</span>
                </Button>
              </Link>
              
              <Link href="/admin/events">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2" data-testid="button-create-promotion">
                  <Star className="w-5 h-5" />
                  <span>Create Promotion</span>
                </Button>
              </Link>
              
              <Link href="/admin/gallery">
                <Button variant="outline" className="w-full h-16 flex flex-col space-y-2" data-testid="button-update-gallery">
                  <Calendar className="w-5 h-5" />
                  <span>Update Gallery</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
