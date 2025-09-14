import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Sparkles, Eye, Leaf, Clock, Star } from "lucide-react";
import customEyelashImage from "@assets/Thiết kế chưa có tên (8)_1757850541617.png";

export default function Services() {
  useEffect(() => {
    document.title = "Services - HOME BASE Beauty Salon";
  }, []);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/service-categories"],
  });

  const { data: contentSettings } = useQuery({
    queryKey: ["/api/content-settings"],
  });

  // Group services by category using boolean flags
  const servicesByCategory = services.reduce((acc: any, service: any) => {
    const categoryNames = [];
    if (service.isNail) categoryNames.push('Nail');
    if (service.isEyelash) categoryNames.push('Eyelash');
    if (service.isFacial) categoryNames.push('Facial');
    
    // If no categories set, put in "General"
    if (categoryNames.length === 0) categoryNames.push('General');
    
    categoryNames.forEach(categoryName => {
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(service);
    });
    
    return acc;
  }, {});

  // Helper function to get category names from boolean flags
  const getServiceCategories = (service: any) => {
    const categories = [];
    if (service.isNail) categories.push('Nail');
    if (service.isEyelash) categories.push('Eyelash');
    if (service.isFacial) categories.push('Facial');
    return categories.length > 0 ? categories : ['General'];
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'nail':
        return <Sparkles className="w-6 h-6" />;
      case 'eyelash':
        return <Eye className="w-6 h-6" />;
      case 'facial':
        return <Leaf className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="services-title">
              Our Signature Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="services-description">
              Indulge in our comprehensive beauty treatments designed to enhance your natural radiance
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full" data-testid="services-tabs">
            <TabsList className="grid w-full grid-cols-4 mb-12" data-testid="tabs-list">
              <TabsTrigger value="all" data-testid="tab-all">All Services</TabsTrigger>
              <TabsTrigger value="Nail" data-testid="tab-nail">Nail</TabsTrigger>
              <TabsTrigger value="Eyelash" data-testid="tab-eyelash">Eyelash</TabsTrigger>
              <TabsTrigger value="Facial" data-testid="tab-facial">Facial</TabsTrigger>
            </TabsList>

            <TabsContent value="all" data-testid="tab-content-all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service: any) => (
                  <Card key={service.id} className="hover-lift" data-testid={`service-card-${service.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 luxury-gradient rounded-2xl flex items-center justify-center text-white">
                          {getCategoryIcon(getServiceCategories(service)[0])}
                        </div>
                        {service.hasDiscount && (
                          <Badge variant="secondary" data-testid={`discount-badge-${service.id}`}>
                            SALE
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl" data-testid={`service-name-${service.id}`}>
                        {service.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground" data-testid={`service-category-${service.id}`}>
                        {getServiceCategories(service).join(", ")} Service
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4" data-testid={`service-description-${service.id}`}>
                        {service.description || `Professional ${getServiceCategories(service)[0].toLowerCase()} service with premium products and expert care.`}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground" data-testid={`service-duration-${service.id}`}>
                            {service.durationMins} mins
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {service.hasDiscount && service.effectivePrice ? (
                            <>
                              <span className="text-sm text-muted-foreground line-through" data-testid={`original-price-${service.id}`}>
                                ${parseFloat(service.basePrice).toFixed(2)}
                              </span>
                              <span className="text-xl font-bold text-primary" data-testid={`effective-price-${service.id}`}>
                                ${service.effectivePrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-primary" data-testid={`price-${service.id}`}>
                              ${parseFloat(service.basePrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link href="/booking" state={{ selectedService: service.id }}>
                        <Button className="w-full" data-testid={`button-book-${service.id}`}>
                          Book This Service
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {Object.entries(servicesByCategory).map(([categoryName, categoryServices]: [string, any]) => (
              <TabsContent key={categoryName} value={categoryName} data-testid={`tab-content-${categoryName.toLowerCase()}`}>
                <div className="mb-8">
                  <div className="relative rounded-3xl overflow-hidden mb-8">
                    <img 
                      src={getCategoryImage(categoryName)} 
                      alt={`${categoryName} services`}
                      className="w-full h-64 object-cover"
                      data-testid={`category-image-${categoryName.toLowerCase()}`}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 luxury-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                          {getCategoryIcon(categoryName)}
                        </div>
                        <h2 className="text-3xl font-serif font-bold" data-testid={`category-title-${categoryName.toLowerCase()}`}>
                          {categoryName} Services
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {categoryServices.map((service: any) => (
                    <Card key={service.id} className="hover-lift" data-testid={`category-service-card-${service.id}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl" data-testid={`category-service-name-${service.id}`}>
                            {service.name}
                          </CardTitle>
                          {service.hasDiscount && (
                            <Badge variant="secondary" data-testid={`category-discount-badge-${service.id}`}>
                              SALE
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4" data-testid={`category-service-description-${service.id}`}>
                          {service.description || `Professional ${getServiceCategories(service)[0].toLowerCase()} service with premium products and expert care.`}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground" data-testid={`category-service-duration-${service.id}`}>
                              {service.durationMins} mins
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {service.hasDiscount && service.effectivePrice ? (
                              <>
                                <span className="text-sm text-muted-foreground line-through" data-testid={`category-original-price-${service.id}`}>
                                  ${parseFloat(service.basePrice).toFixed(2)}
                                </span>
                                <span className="text-xl font-bold text-primary" data-testid={`category-effective-price-${service.id}`}>
                                  ${service.effectivePrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-primary" data-testid={`category-price-${service.id}`}>
                                ${parseFloat(service.basePrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Link href="/booking" state={{ selectedService: service.id }}>
                          <Button className="w-full" data-testid={`category-button-book-${service.id}`}>
                            Book This Service
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-services">
                No services available at the moment. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer contentSettings={contentSettings} />
    </div>
  );
}
