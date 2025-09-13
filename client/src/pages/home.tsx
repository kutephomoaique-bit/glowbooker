import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PromotionsSection from "@/components/PromotionsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "HOME BASE Beauty Salon - Welcome Back";
  }, []);

  const { data: contentSettings } = useQuery({
    queryKey: ["/api/content-settings"],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: promotions } = useQuery({
    queryKey: ["/api/promotions"],
  });

  const { data: gallery } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const { data: feedback } = useQuery({
    queryKey: ["/api/feedback"],
  });

  const { data: myBookings } = useQuery({
    queryKey: ["/api/my-bookings"],
  });

  const upcomingBookings = myBookings?.filter(
    booking => new Date(booking.dateTime) > new Date() && booking.status !== 'CANCELLED'
  )?.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Welcome back, {user?.firstName || 'Beautiful'}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready for your next beauty transformation?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Quick Actions */}
            <Card data-testid="quick-actions-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/booking">
                  <Button className="w-full" data-testid="button-book-now">
                    Book New Appointment
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" className="w-full" data-testid="button-my-account">
                    <User className="w-4 h-4 mr-2" />
                    My Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card data-testid="upcoming-bookings-card">
              <CardHeader>
                <CardTitle>Your Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings && upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="p-3 bg-muted/30 rounded-lg"
                        data-testid={`booking-${booking.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-service-${booking.id}`}>
                              {booking.service.name}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-datetime-${booking.id}`}>
                              {new Date(booking.dateTime).toLocaleDateString()} at{' '}
                              {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            data-testid={`status-${booking.id}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Link href="/account">
                      <Button variant="ghost" className="w-full text-sm" data-testid="link-view-all-bookings">
                        View All Bookings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4" data-testid="text-no-bookings">
                      No upcoming appointments
                    </p>
                    <Link href="/booking">
                      <Button size="sm" data-testid="button-book-first">
                        Book Your First Appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <HeroSection contentSettings={contentSettings} showWelcome={false} />
      <ServicesSection services={services} />
      <PromotionsSection promotions={promotions} />
      <GallerySection images={gallery} />
      <TestimonialsSection feedback={feedback} />
      <ContactSection contentSettings={contentSettings} />
      <Footer contentSettings={contentSettings} />
    </div>
  );
}
