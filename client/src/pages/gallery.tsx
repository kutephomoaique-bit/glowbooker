import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { GalleryImage, ContentSettings } from "@shared/schema";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    document.title = "Gallery - HOME BASE Beauty Salon";
  }, []);

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: activeFilter === 'all' ? ["/api/gallery"] : ["/api/gallery", { category: activeFilter }],
  });

  const { data: contentSettings } = useQuery<ContentSettings>({
    queryKey: ["/api/content-settings"],
  });

  const categories = ['all', 'Nail', 'Eyelash', 'Facial'];
  
  // Fallback images if no images are provided
  const fallbackImages: GalleryImage[] = [
    {
      id: '1',
      url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Nail' as const,
      caption: "Elegant nail art designs",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '2', 
      url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Eyelash' as const,
      caption: "Beautiful eyelash extensions",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '3',
      url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Facial' as const,
      caption: "Glowing skin after facial treatment",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '4',
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Nail' as const,
      caption: "Vibrant nail polish colors",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '5',
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Eyelash' as const,
      caption: "Professional makeup with perfect lashes",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '6',
      url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Facial' as const,
      caption: "Serene spa facial treatment",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '7',
      url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Nail' as const,
      caption: "French manicure perfection",
      order: 0,
      createdAt: new Date()
    },
    {
      id: '8',
      url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Facial' as const,
      caption: "Relaxing spa environment",
      order: 0,
      createdAt: new Date()
    }
  ];

  const displayImages = images.length > 0 ? images : fallbackImages.filter(img => 
    activeFilter === 'all' || img.category === activeFilter
  );

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
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="gallery-title">
              Our Gallery
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="gallery-description">
              Showcasing our beautiful work and transformations
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted rounded-full p-1">
              <div className="flex space-x-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    variant={activeFilter === category ? "default" : "ghost"}
                    className={`px-6 py-2 rounded-full font-medium ${
                      activeFilter === category 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid={`filter-${category.toLowerCase()}`}
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayImages.map((image: GalleryImage) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div 
                    className="group cursor-pointer hover-lift relative overflow-hidden rounded-2xl"
                    data-testid={`gallery-image-${image.id}`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img 
                      src={image.url} 
                      alt={image.caption || `Gallery image ${image.id}`} 
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                      data-testid={`img-${image.id}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-black" data-testid={`badge-${image.id}`}>
                        {image.category}
                      </Badge>
                    </div>
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm font-medium" data-testid={`caption-${image.id}`}>
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0" data-testid={`dialog-${image.id}`}>
                  <div className="relative">
                    <img 
                      src={image.url} 
                      alt={image.caption || `Gallery image ${image.id}`}
                      className="w-full h-auto max-h-[80vh] object-contain"
                      data-testid={`dialog-img-${image.id}`}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" data-testid={`dialog-badge-${image.id}`}>
                        {image.category}
                      </Badge>
                    </div>
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <p className="text-white text-lg font-medium" data-testid={`dialog-caption-${image.id}`}>
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
          
          {displayImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-images">
                No images available for the selected category.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer contentSettings={contentSettings} />
    </div>
  );
}
