import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  id: string;
  url: string;
  category: 'Nail' | 'Eyelash' | 'Facial' | 'General';
  caption?: string;
}

interface GallerySectionProps {
  images?: GalleryImage[];
}

export default function GallerySection({ images = [] }: GallerySectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const categories = ['all', 'Nail', 'Eyelash', 'Facial'];
  
  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(image => image.category === activeFilter);

  // Fallback images if no images are provided
  const fallbackImages = [
    {
      id: '1',
      url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Nail' as const,
      caption: "Elegant nail art designs"
    },
    {
      id: '2', 
      url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Eyelash' as const,
      caption: "Beautiful eyelash extensions"
    },
    {
      id: '3',
      url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Facial' as const,
      caption: "Glowing skin after facial treatment"
    },
    {
      id: '4',
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Nail' as const,
      caption: "Vibrant nail polish colors"
    },
    {
      id: '5',
      url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Eyelash' as const,
      caption: "Professional makeup with perfect lashes"
    },
    {
      id: '6',
      url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
      category: 'Facial' as const,
      caption: "Serene spa facial treatment"
    }
  ];

  const displayImages = images.length > 0 ? filteredImages : fallbackImages.filter(img => 
    activeFilter === 'all' || img.category === activeFilter
  );

  return (
    <section id="gallery" className="py-20" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4" data-testid="gallery-title">
            Our Gallery
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="gallery-description">
            Showcasing our beautiful work and transformations
          </p>
        </div>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((image) => (
            <div 
              key={image.id} 
              className="group cursor-pointer hover-lift"
              data-testid={`gallery-image-${image.id}`}
            >
              <img 
                src={image.url} 
                alt={image.caption || `Gallery image ${image.id}`} 
                className="w-full h-80 object-cover rounded-2xl"
                data-testid={`img-${image.id}`}
              />
              {image.caption && (
                <p className="text-center text-sm text-muted-foreground mt-2" data-testid={`caption-${image.id}`}>
                  {image.caption}
                </p>
              )}
            </div>
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
  );
}
