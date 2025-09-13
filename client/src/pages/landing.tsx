import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Service, EventPromo, GalleryImage, Feedback, ContentSettings } from "@shared/schema";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PromotionsSection from "@/components/PromotionsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Landing() {
  useEffect(() => {
    document.title = "HOME BASE Beauty Salon - Luxury Nail, Eyelash & Facial Services";
  }, []);

  const { data: contentSettings } = useQuery<ContentSettings>({
    queryKey: ["/api/content-settings"],
  });

  const { data: services } = useQuery<any[]>({
    queryKey: ["/api/services"],
  });

  const { data: promotions } = useQuery<any[]>({
    queryKey: ["/api/promotions"],
  });

  const { data: gallery } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: feedback } = useQuery<any[]>({
    queryKey: ["/api/feedback"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection contentSettings={contentSettings} />
      <ServicesSection services={services} />
      <PromotionsSection promotions={promotions} />
      <GallerySection images={gallery} />
      <TestimonialsSection feedback={feedback} />
      <ContactSection contentSettings={contentSettings} />
      <Footer contentSettings={contentSettings} />
    </div>
  );
}
