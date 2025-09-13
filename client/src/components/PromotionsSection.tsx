import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent } from "lucide-react";

interface EventPromo {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'AMOUNT';
  value: string;
  startAt: string;
  endAt: string;
  scopeType: 'GLOBAL' | 'CATEGORY' | 'SERVICE';
}

interface PromotionsSectionProps {
  promotions?: EventPromo[];
}

export default function PromotionsSection({ promotions = [] }: PromotionsSectionProps) {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  const formatDiscountValue = (promo: EventPromo) => {
    if (promo.discountType === 'PERCENT') {
      return `${parseFloat(promo.value)}% OFF`;
    } else {
      return `$${parseFloat(promo.value)} OFF`;
    }
  };

  const formatEndDate = (endDate: string) => {
    return new Date(endDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-20" data-testid="promotions-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4" data-testid="promotions-title">
            Special Offers
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="promotions-description">
            Limited time promotions for our valued clients
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.slice(0, 2).map((promo, index) => (
            <div 
              key={promo.id}
              className={`relative overflow-hidden rounded-3xl p-8 text-white ${
                index === 0 
                  ? 'luxury-gradient' 
                  : 'bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-foreground'
              }`}
              data-testid={`promotion-${promo.id}`}
            >
              <div className="relative z-10">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  index === 0 
                    ? 'bg-white/20 text-white' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  <Badge variant="secondary" data-testid={`badge-${promo.id}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    Limited Time
                  </Badge>
                </div>
                
                <h3 className={`text-3xl font-serif font-bold mb-4 ${
                  index === 0 ? 'text-white' : 'text-foreground'
                }`} data-testid={`title-${promo.id}`}>
                  {promo.title}
                </h3>
                
                <p className={`mb-6 ${
                  index === 0 ? 'text-white/90' : 'text-muted-foreground'
                }`} data-testid={`description-${promo.id}`}>
                  {promo.description}
                </p>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`text-2xl font-bold flex items-center ${
                    index === 0 ? 'text-white' : 'text-foreground'
                  }`} data-testid={`discount-${promo.id}`}>
                    <Percent className="w-5 h-5 mr-1" />
                    {formatDiscountValue(promo)}
                  </span>
                  <span className={`${
                    index === 0 ? 'text-white/80' : 'text-muted-foreground'
                  }`} data-testid={`valid-until-${promo.id}`}>
                    Valid until {formatEndDate(promo.endAt)}
                  </span>
                </div>
                
                <Link href="/booking">
                  <Button 
                    className={`${
                      index === 0 
                        ? 'bg-white text-primary hover:bg-white/90' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    } font-semibold transition-all`}
                    data-testid={`button-claim-${promo.id}`}
                  >
                    {index === 0 ? 'Claim Offer' : 'Book Package'}
                  </Button>
                </Link>
              </div>
              
              {index === 0 && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              )}
            </div>
          ))}
        </div>
        
        {promotions.length > 2 && (
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" data-testid="button-view-all-offers">
                View All Offers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
