import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Users, Award } from "lucide-react";

interface HeroSectionProps {
  contentSettings?: any;
  showWelcome?: boolean;
}

export default function HeroSection({ contentSettings, showWelcome = true }: HeroSectionProps) {
  const slogans = contentSettings?.slogans || [
    "Elegance in Every Detail",
    "Your Beauty, Perfectly Timed", 
    "Serenity • Shine • Sophistication"
  ];

  if (!showWelcome) {
    return null;
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50"></div>
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-foreground leading-tight" data-testid="hero-title">
                <span className="text-shadow">{slogans[0]?.split(' ').slice(0, -2).join(' ') || 'Elegance in'}</span><br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {slogans[0]?.split(' ').slice(-2).join(' ') || 'Every Detail'}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg" data-testid="hero-description">
                Experience luxury beauty services with our expert team. Specializing in premium nail care, eyelash extensions, and rejuvenating facial treatments.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 hover-lift"
                  data-testid="button-book-appointment"
                >
                  Book Appointment
                </Button>
              </Link>
              <Link href="/services">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                  data-testid="button-view-services"
                >
                  View Services
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2" data-testid="hero-stat-rating">
                <Star className="w-4 h-4 text-accent fill-current" />
                <span>5.0 Rating</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="hero-stat-clients">
                <Users className="w-4 h-4 text-accent" />
                <span>1000+ Happy Clients</span>
              </div>
              <div className="flex items-center space-x-2" data-testid="hero-stat-professionals">
                <Award className="w-4 h-4 text-accent" />
                <span>Licensed Professionals</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Luxury beauty treatments showcase" 
                className="rounded-3xl shadow-2xl w-full"
                data-testid="hero-image"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 luxury-gradient rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-accent/30 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
