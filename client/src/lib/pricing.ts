import { Service, EventPromo } from "@shared/schema";

export interface EffectivePrice {
  original: number;
  final: number;
  discount: number;
  hasDiscount: boolean;
  appliedPromo?: EventPromo;
}

export function calculateEffectivePrice(service: Service, activePromos: EventPromo[]): EffectivePrice {
  const basePrice = parseFloat(service.basePrice);
  let finalPrice = basePrice;
  let discount = 0;
  let appliedPromo: EventPromo | undefined;

  // Find the best applicable promo
  const applicablePromos = activePromos.filter(promo => {
    if (promo.scopeType === 'GLOBAL') return true;
    if (promo.scopeType === 'CATEGORY') return promo.scopeId === service.categoryId;
    if (promo.scopeType === 'SERVICE') return promo.scopeId === service.id;
    return false;
  });

  // Apply the best discount (highest absolute value)
  for (const promo of applicablePromos) {
    let promoDiscount = 0;
    
    if (promo.discountType === 'PERCENT') {
      promoDiscount = (basePrice * parseFloat(promo.value)) / 100;
    } else {
      promoDiscount = parseFloat(promo.value);
    }

    if (promoDiscount > discount) {
      discount = promoDiscount;
      appliedPromo = promo;
    }
  }

  finalPrice = Math.max(0, basePrice - discount);

  return {
    original: basePrice,
    final: finalPrice,
    discount,
    hasDiscount: discount > 0,
    appliedPromo,
  };
}
