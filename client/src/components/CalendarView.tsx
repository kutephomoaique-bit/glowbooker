import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths 
} from "date-fns";
import type { Booking, Service, ServiceCategory, User as DBUser, Staff } from "@shared/schema";

// Extended booking type with populated relations for calendar display
export interface BookingWithRelations extends Omit<Booking, 'userId' | 'serviceId' | 'staffId'> {
  user?: DBUser;
  service: Service & {
    category: ServiceCategory;
  };
  staff?: Staff;
}

interface CalendarViewProps {
  bookings: BookingWithRelations[];
  onUpdateBookingStatus?: (bookingId: string, status: string) => void;
  onEditBooking?: (booking: BookingWithRelations) => void;
}

export default function CalendarView({ bookings, onUpdateBookingStatus, onEditBooking }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DONE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <AlertCircle className="w-3 h-3" />;
      case 'CANCELLED':
        return <XCircle className="w-3 h-3" />;
      case 'DONE':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.dateTime), day)
    ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleBookingClick = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setShowBookingDialog(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedBooking && onUpdateBookingStatus) {
      onUpdateBookingStatus(selectedBooking.id, status);
      setShowBookingDialog(false);
    }
  };

  const handleEdit = () => {
    if (selectedBooking && onEditBooking) {
      onEditBooking(selectedBooking);
      setShowBookingDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-serif" data-testid="calendar-title">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                data-testid="button-previous-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                data-testid="button-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b" data-testid="calendar-grid">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div
                key={day}
                className="p-2 md:p-4 text-center font-medium text-muted-foreground border-r last:border-r-0 bg-muted/30 text-sm md:text-base"
                data-testid={`day-header-${day.toLowerCase()}`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, dayIndex) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-1 sm:p-2 border-r border-b last:border-r-0 ${
                    isCurrentMonth 
                      ? 'bg-background' 
                      : 'bg-muted/20'
                  } ${
                    isToday 
                      ? 'bg-primary/5 border-primary/20' 
                      : ''
                  }`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  } ${
                    isToday ? 'text-primary font-bold' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-1.5 sm:p-1 rounded-sm text-xs cursor-pointer hover:opacity-80 transition-opacity border ${getStatusColor(booking.status)} min-h-[44px] sm:min-h-auto touch-manipulation`}
                        onClick={() => handleBookingClick(booking)}
                        data-testid={`calendar-booking-${booking.id}`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          {getStatusIcon(booking.status)}
                          <span className="font-medium truncate text-xs sm:text-xs">
                            {format(new Date(booking.dateTime), 'HH:mm')}
                          </span>
                        </div>
                        <div className="truncate font-medium text-xs">
                          {booking.service.name}
                        </div>
                        <div className="truncate text-xs opacity-75 hidden sm:block">
                          {booking.customerName || booking.user?.firstName || 'Guest'}
                        </div>
                      </div>
                    ))}
                    
                    {dayBookings.length > 2 && (
                      <div 
                        className="text-xs text-muted-foreground text-center p-1 rounded cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => {
                          // Show the first remaining booking when clicking "+N more"
                          if (dayBookings.length > 2) {
                            handleBookingClick(dayBookings[2]);
                          }
                        }}
                        data-testid={`more-bookings-${format(day, 'yyyy-MM-dd')}`}
                      >
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md mx-4" data-testid="booking-details-dialog">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg" data-testid="dialog-service-name">
                    {selectedBooking.service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="dialog-service-category">
                    {selectedBooking.service.category.name}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span data-testid="dialog-booking-date">
                        {format(new Date(selectedBooking.dateTime), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span data-testid="dialog-booking-time">
                        {format(new Date(selectedBooking.dateTime), 'h:mm a')} ({selectedBooking.durationMins}m)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span data-testid="dialog-customer-name">
                        {selectedBooking.customerName || selectedBooking.user?.firstName || 'Guest'}
                      </span>
                    </div>
                    {selectedBooking.customerPhone && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span data-testid="dialog-customer-phone">
                          {selectedBooking.customerPhone}
                        </span>
                      </div>
                    )}
                    {selectedBooking.customerEmail && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span data-testid="dialog-customer-email">
                          {selectedBooking.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(selectedBooking.status)} data-testid="dialog-booking-status">
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(selectedBooking.status)}
                      <span>{selectedBooking.status}</span>
                    </span>
                  </Badge>
                  
                  {selectedBooking.staff && (
                    <div className="text-sm text-muted-foreground" data-testid="dialog-staff-name">
                      Staff: {selectedBooking.staff.name}
                    </div>
                  )}
                </div>
                
                {selectedBooking.notes && (
                  <div className="p-3 bg-muted/30 rounded text-sm" data-testid="dialog-booking-notes">
                    <strong>Notes:</strong> {selectedBooking.notes}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant={selectedBooking.status === 'CONFIRMED' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('CONFIRMED')}
                  disabled={selectedBooking.status === 'CONFIRMED'}
                  data-testid="dialog-button-confirm"
                >
                  Confirm
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedBooking.status === 'DONE' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('DONE')}
                  disabled={selectedBooking.status === 'DONE'}
                  data-testid="dialog-button-complete"
                >
                  Complete
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedBooking.status === 'CANCELLED' ? 'destructive' : 'outline'}
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  disabled={selectedBooking.status === 'CANCELLED'}
                  data-testid="dialog-button-cancel"
                >
                  Cancel
                </Button>
                {onEditBooking && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleEdit}
                    data-testid="dialog-button-edit"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}