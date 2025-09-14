import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Leaf } from "lucide-react";
import customEyelashImage from "@assets/Thiết kế chưa có tên (8)_1757850541617.png";

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  effectivePrice?: number;
  hasDiscount?: boolean;
  isNail: boolean;
  isEyelash: boolean;
  isFacial: boolean;
}

interface ServicesSectionProps {
  services?: Service[];
}

export default function ServicesSection({ services = [] }: ServicesSectionProps) {
  // Group services by category based on boolean flags
  const servicesByCategory = services.reduce((acc, service) => {
    // Add service to multiple categories if it belongs to multiple
    if (service.isNail) {
      if (!acc["Nail"]) acc["Nail"] = [];
      acc["Nail"].push(service);
    }
    if (service.isEyelash) {
      if (!acc["Eyelash"]) acc["Eyelash"] = [];
      acc["Eyelash"].push(service);
    }
    if (service.isFacial) {
      if (!acc["Facial"]) acc["Facial"] = [];
      acc["Facial"].push(service);
    }
    return acc;
  }, {} as Record<string, Service[]>);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nail':
        return <Sparkles className="text-white text-2xl" />;
      case 'eyelash':
        return <Eye className="text-white text-2xl" />;
      case 'facial':
        return <Leaf className="text-white text-2xl" />;
      default:
        return <Sparkles className="text-white text-2xl" />;
    }
  };

  const getCategoryImage = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nail':
        return "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
      case 'eyelash':
        return customEyelashImage;
      case 'facial':
        return "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
      default:
        return "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
    }
  };

  const getCategoryDescription = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nail':
        return "Premium manicures, pedicures, nail art, and gel treatments using top-quality products for lasting beauty.";
      case 'eyelash':
        return "Professional eyelash extensions, lifts, and tinting to enhance your natural beauty and create stunning looks.";
      case 'facial':
        return "Rejuvenating facial treatments tailored to your skin type, using premium products for radiant, healthy skin.";
      default:
        return "Professional beauty services tailored to your needs.";
    }
  };

  return (
    <section id="services" className="py-20 bg-muted/30" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="services-title">
            Our Signature Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="services-description">
            Indulge in our comprehensive beauty treatments designed to enhance your natural radiance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
            <div 
              key={categoryName} 
              className="bg-card rounded-3xl p-8 shadow-lg hover-lift group"
              data-testid={`service-category-${categoryName.toLowerCase()}`}
            >
              <div className="mb-6">
                <img 
                  src={getCategoryImage(categoryName)} 
                  alt={`Professional ${categoryName.toLowerCase()} services`} 
                  className="w-full h-48 object-cover rounded-2xl mb-4"
                  data-testid={`img-${categoryName.toLowerCase()}`}
                />
                <div className="w-16 h-16 luxury-gradient rounded-2xl flex items-center justify-center mb-4">
                  {getCategoryIcon(categoryName)}
                </div>
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-foreground mb-3" data-testid={`title-${categoryName.toLowerCase()}`}>
                {categoryName} Services
              </h3>
              
              <p className="text-muted-foreground mb-6" data-testid={`description-${categoryName.toLowerCase()}`}>
                {getCategoryDescription(categoryName)}
              </p>
              
              <div className="space-y-2 mb-6">
                {categoryServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex justify-between items-center" data-testid={`service-${service.id}`}>
                    <span className="text-sm" data-testid={`service-name-${service.id}`}>{service.name}</span>
                    <div className="flex items-center space-x-2">
                      {service.hasDiscount && service.effectivePrice ? (
                        <>
                          <span className="text-xs text-muted-foreground line-through" data-testid={`original-price-${service.id}`}>
                            ${parseFloat(service.basePrice).toFixed(2)}
                          </span>
                          <span className="text-primary font-semibold" data-testid={`effective-price-${service.id}`}>
                            ${service.effectivePrice.toFixed(2)}
                          </span>
                          <Badge variant="secondary" className="text-xs" data-testid={`discount-badge-${service.id}`}>
                            SALE
                          </Badge>
                        </>
                      ) : (
                        <span className="text-primary font-semibold" data-testid={`price-${service.id}`}>
                          ${parseFloat(service.basePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/booking">
                <Button 
                  className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                  data-testid={`button-book-${categoryName.toLowerCase()}`}
                >
                  Book {categoryName} Service
                </Button>
              </Link>
            </div>
          ))}
        </div>
        
        {Object.keys(servicesByCategory).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-services">
              No services available at the moment. Please check back later.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
