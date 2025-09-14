import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import CalendarView from "@/components/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { BookingWithRelations } from "@/components/CalendarView";

export default function AdminBookings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingBooking, setEditingBooking] = useState<BookingWithRelations | null>(null);
  const [editDialog, setEditDialog] = useState(false);

  useEffect(() => {
    document.title = "Bookings Management - Admin";
    
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: bookings = [], error: bookingsError } = useQuery<BookingWithRelations[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (bookingsError && isUnauthorizedError(bookingsError as Error)) {
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
  }, [bookingsError, toast]);

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, ...bookingData }: { id: string; [key: string]: any }) => {
      return apiRequest("PUT", `/api/admin/bookings/${id}`, bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      setEditDialog(false);
      setEditingBooking(null);
    },
    onError: (error) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to update booking.",
        variant: "destructive",
      });
    },
  });

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

  const filteredBookings = bookings.filter((booking: BookingWithRelations) => {
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    if (selectedDate) {
      const bookingDate = new Date(booking.dateTime);
      return (
        bookingDate.getDate() === selectedDate.getDate() &&
        bookingDate.getMonth() === selectedDate.getMonth() &&
        bookingDate.getFullYear() === selectedDate.getFullYear()
      );
    }
    return true;
  });

  const upcomingBookings = bookings.filter((booking: BookingWithRelations) => 
    new Date(booking.dateTime) > new Date() && booking.status !== 'CANCELLED'
  );

  const todayBookings = bookings.filter((booking: BookingWithRelations) => {
    const today = new Date();
    const bookingDate = new Date(booking.dateTime);
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  });

  const updateBookingStatus = (bookingId: string, status: string) => {
    updateBookingMutation.mutate({ id: bookingId, status });
  };

  const openEditDialog = (booking: BookingWithRelations) => {
    setEditingBooking(booking);
    setEditDialog(true);
  };

  if (isLoading || (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="bookings-title">
            Bookings Management
          </h1>
          <p className="text-muted-foreground" data-testid="bookings-description">
            Manage customer appointments and schedules
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stat-total-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-bookings-count">
                {bookings.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-today-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="today-bookings-count">
                {todayBookings.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-upcoming-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="upcoming-bookings-count">
                {upcomingBookings.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full" data-testid="bookings-tabs">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
            <TabsTrigger value="all" data-testid="tab-all">All Bookings</TabsTrigger>
            <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* All Bookings Tab */}
          <TabsContent value="all" data-testid="tab-content-all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Bookings</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="all-bookings-list">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking: BookingWithRelations) => (
                      <div 
                        key={booking.id} 
                        className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        data-testid={`booking-${booking.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground" data-testid={`booking-service-${booking.id}`}>
                                {booking.service.name}
                              </h3>
                              <p className="text-sm text-muted-foreground" data-testid={`booking-category-${booking.id}`}>
                                {[
                                  booking.service.isNail && "Nail",
                                  booking.service.isEyelash && "Eyelash", 
                                  booking.service.isFacial && "Facial"
                                ].filter(Boolean).join(", ") || "No categories"}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span data-testid={`booking-customer-${booking.id}`}>
                                  {booking.customerName || booking.user?.firstName || 'Guest'}
                                </span>
                              </div>
                              {booking.customerPhone && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  <span data-testid={`booking-phone-${booking.id}`}>
                                    {booking.customerPhone}
                                  </span>
                                </div>
                              )}
                              {booking.customerEmail && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Mail className="w-4 h-4" />
                                  <span data-testid={`booking-email-${booking.id}`}>
                                    {booking.customerEmail}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span data-testid={`booking-date-${booking.id}`}>
                                  {format(new Date(booking.dateTime), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span data-testid={`booking-time-${booking.id}`}>
                                  {format(new Date(booking.dateTime), 'h:mm a')} ({booking.durationMins}m)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(booking.status)} data-testid={`booking-status-${booking.id}`}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(booking.status)}
                                <span>{booking.status}</span>
                              </span>
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditDialog(booking)}
                              data-testid={`button-edit-booking-${booking.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-3 p-2 bg-muted/30 rounded text-sm" data-testid={`booking-notes-${booking.id}`}>
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant={booking.status === 'CONFIRMED' ? 'default' : 'outline'}
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            disabled={booking.status === 'CONFIRMED'}
                            data-testid={`button-confirm-${booking.id}`}
                          >
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant={booking.status === 'DONE' ? 'default' : 'outline'}
                            onClick={() => updateBookingStatus(booking.id, 'DONE')}
                            disabled={booking.status === 'DONE'}
                            data-testid={`button-complete-${booking.id}`}
                          >
                            Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant={booking.status === 'CANCELLED' ? 'destructive' : 'outline'}
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                            disabled={booking.status === 'CANCELLED'}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground" data-testid="no-bookings-text">
                        No bookings found matching the current filters.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Today Tab */}
          <TabsContent value="today" data-testid="tab-content-today">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="today-bookings-list">
                  {todayBookings.length > 0 ? (
                    todayBookings.map((booking: BookingWithRelations) => (
                      <div 
                        key={booking.id} 
                        className="p-4 border rounded-lg"
                        data-testid={`today-booking-${booking.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`today-service-${booking.id}`}>
                              {booking.service.name}
                            </h3>
                            <p className="text-sm text-muted-foreground" data-testid={`today-customer-${booking.id}`}>
                              {booking.customerName || booking.user?.firstName || 'Guest'} • {format(new Date(booking.dateTime), 'h:mm a')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)} data-testid={`today-status-${booking.id}`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground" data-testid="no-today-bookings">
                        No appointments scheduled for today.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" data-testid="tab-content-upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="upcoming-bookings-list">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.slice(0, 10).map((booking: BookingWithRelations) => (
                      <div 
                        key={booking.id} 
                        className="p-4 border rounded-lg"
                        data-testid={`upcoming-booking-${booking.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`upcoming-service-${booking.id}`}>
                              {booking.service.name}
                            </h3>
                            <p className="text-sm text-muted-foreground" data-testid={`upcoming-details-${booking.id}`}>
                              {booking.customerName || booking.user?.firstName || 'Guest'} • {format(new Date(booking.dateTime), 'MMM dd, h:mm a')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)} data-testid={`upcoming-status-${booking.id}`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground" data-testid="no-upcoming-bookings">
                        No upcoming appointments.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" data-testid="tab-content-calendar">
            <CalendarView 
              bookings={bookings}
              onUpdateBookingStatus={updateBookingStatus}
              onEditBooking={openEditDialog}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Booking Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent data-testid="edit-booking-dialog">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Service:</strong> {editingBooking.service.name}
                  </div>
                  <div>
                    <strong>Customer:</strong> {editingBooking.customerName || editingBooking.user?.firstName || 'Guest'}
                  </div>
                  <div>
                    <strong>Date:</strong> {format(new Date(editingBooking.dateTime), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    <strong>Time:</strong> {format(new Date(editingBooking.dateTime), 'h:mm a')}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={editingBooking.status}
                    onValueChange={(value) => setEditingBooking({ ...editingBooking, status: value as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE' })}
                    data-testid="edit-status-select"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setEditDialog(false)} data-testid="button-cancel-edit">
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => updateBookingMutation.mutate({ id: editingBooking.id, status: editingBooking.status })}
                    disabled={updateBookingMutation.isPending}
                    data-testid="button-save-edit"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
