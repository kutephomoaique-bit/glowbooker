import { Star } from "lucide-react";

interface Feedback {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  customerName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface TestimonialsSectionProps {
  feedback?: Feedback[];
}

export default function TestimonialsSection({ feedback = [] }: TestimonialsSectionProps) {
  // Fallback testimonials if no feedback is provided
  const fallbackTestimonials = [
    {
      id: '1',
      rating: 5,
      comment: "Absolutely amazing service! The nail art was exactly what I wanted and the staff was so professional. Will definitely be coming back!",
      customerName: "Sarah Johnson",
      role: "Regular Client"
    },
    {
      id: '2',
      rating: 5, 
      comment: "The facial treatment was incredible! My skin has never looked better. The atmosphere is so relaxing and luxurious.",
      customerName: "Emma Davis",
      role: "Facial Client"
    },
    {
      id: '3',
      rating: 5,
      comment: "Best eyelash extensions I've ever had! They look so natural yet dramatic. The technician was skilled and gentle.",
      customerName: "Maya Rodriguez", 
      role: "Lash Client"
    }
  ];

  const displayTestimonials = feedback.length > 0 
    ? feedback.filter(f => f.rating >= 4).slice(0, 3)
    : fallbackTestimonials;

  const getCustomerName = (testimonial: any) => {
    if (testimonial.customerName) return testimonial.customerName;
    if (testimonial.user?.firstName) {
      return `${testimonial.user.firstName} ${testimonial.user.lastName || ''}`.trim();
    }
    return "Anonymous Customer";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-accent fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <section className="py-20 bg-muted/30" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4" data-testid="testimonials-title">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="testimonials-description">
            Real feedback from our satisfied customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-card rounded-3xl p-8 shadow-lg"
              data-testid={`testimonial-${testimonial.id}`}
            >
              <div className="flex items-center mb-4" data-testid={`rating-${testimonial.id}`}>
                <div className="flex">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6" data-testid={`comment-${testimonial.id}`}>
                "{testimonial.comment}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getCustomerName(testimonial)}`}
                  alt={`${getCustomerName(testimonial)} avatar`} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  data-testid={`avatar-${testimonial.id}`}
                />
                <div>
                  <h4 className="font-semibold text-foreground" data-testid={`name-${testimonial.id}`}>
                    {getCustomerName(testimonial)}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`role-${testimonial.id}`}>
                    {(testimonial as any).role || "Valued Client"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayTestimonials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-testimonials">
              No customer testimonials available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
