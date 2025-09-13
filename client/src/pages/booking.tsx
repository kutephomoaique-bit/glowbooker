import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { insertBookingSchema } from "@shared/schema";
import { format, addDays, isAfter, isBefore, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Booking() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    document.title = "Book Appointment - HOME BASE Beauty Salon";
    
    // Pre-fill customer info if logged in
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: contentSettings } = useQuery({
    queryKey: ["/api/content-settings"],
  });

  const selectedServiceData = services.find((s: any) => s.id === selectedService);

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const openHour = 9;
    const closeHour = 19;
    
    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < closeHour - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const calculateTotal = () => {
    if (!selectedServiceData) return 0;
    return selectedServiceData.effectivePrice || parseFloat(selectedServiceData.basePrice);
  };

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked. We'll contact you shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
      
      // Reset form
      setSelectedService("");
      setSelectedStaff("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setCustomerInfo({
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
        phone: user?.phone || "",
        email: user?.email || "",
        notes: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = setMinutes(setHours(selectedDate, hours), minutes);

    const bookingData = {
      userId: user?.id || null,
      serviceId: selectedService,
      staffId: selectedStaff || null,
      dateTime: bookingDateTime.toISOString(),
      durationMins: selectedServiceData?.durationMins || 60,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      notes: customerInfo.notes || null,
      totalPrice: calculateTotal().toString(),
    };

    createBookingMutation.mutate(bookingData);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    const maxDate = addDays(today, 60); // Allow booking up to 60 days in advance
    return isBefore(date, today) || isAfter(date, maxDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="booking-title">
              Book Your Appointment
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="booking-description">
              Choose your preferred service and time slot
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} data-testid="booking-form">
            <div className="bg-card rounded-3xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Service Selection */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Select Service *
                    </Label>
                    <RadioGroup 
                      value={selectedService} 
                      onValueChange={setSelectedService}
                      className="space-y-3"
                      data-testid="service-selection"
                    >
                      {services.map((service: any) => (
                        <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50" data-testid={`service-option-${service.id}`}>
                          <RadioGroupItem value={service.id} id={service.id} />
                          <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-foreground" data-testid={`service-name-${service.id}`}>
                                  {service.name}
                                </p>
                                <p className="text-sm text-muted-foreground" data-testid={`service-category-${service.id}`}>
                                  {service.category.name} • {service.durationMins} mins
                                </p>
                              </div>
                              <div className="text-right">
                                {service.hasDiscount && service.effectivePrice ? (
                                  <div>
                                    <span className="text-sm text-muted-foreground line-through" data-testid={`original-price-${service.id}`}>
                                      ${parseFloat(service.basePrice).toFixed(2)}
                                    </span>
                                    <p className="text-primary font-semibold" data-testid={`effective-price-${service.id}`}>
                                      ${service.effectivePrice.toFixed(2)}
                                    </p>
                                    <Badge variant="secondary" className="text-xs" data-testid={`discount-badge-${service.id}`}>
                                      SALE
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-primary font-semibold" data-testid={`price-${service.id}`}>
                                    ${parseFloat(service.basePrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {staff.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        Preferred Staff (Optional)
                      </Label>
                      <Select value={selectedStaff} onValueChange={setSelectedStaff} data-testid="staff-selection">
                        <SelectTrigger>
                          <SelectValue placeholder="Any available staff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any available staff</SelectItem>
                          {staff.map((member: any) => (
                            <SelectItem key={member.id} value={member.id} data-testid={`staff-option-${member.id}`}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Preferred Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                          data-testid="date-picker-trigger"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" data-testid="date-picker-content">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={isDateDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Preferred Time *
                    </Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} data-testid="time-selection">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} data-testid={`time-option-${time}`}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Customer Information */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-3 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-3 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-3 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-sm font-semibold text-foreground mb-3 block">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      placeholder="Any special requests or notes..."
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                      data-testid="textarea-notes"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="total-price">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createBookingMutation.isPending}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90"
                    data-testid="button-confirm-booking"
                  >
                    {createBookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card data-testid="info-card-location">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {contentSettings?.address || "123 Beauty Street, Luxury District"}
                </p>
              </CardContent>
            </Card>
            
            <Card data-testid="info-card-hours">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Mon-Fri: 9AM-7PM<br />
                  Sat: 9AM-6PM<br />
                  Sun: 10AM-5PM
                </p>
              </CardContent>
            </Card>
            
            <Card data-testid="info-card-contact">
              <CardContent className="p-6 text-center">
                <User className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Contact</h3>
                <p className="text-sm text-muted-foreground">
                  {contentSettings?.phone || "(555) 123-4567"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer contentSettings={contentSettings} />
    </div>
  );
}
