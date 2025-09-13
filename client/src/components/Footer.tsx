import { Link } from "wouter";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

interface FooterProps {
  contentSettings?: any;
}

export default function Footer({ contentSettings }: FooterProps) {
  const contactInfo = {
    address: contentSettings?.address || "123 Beauty Street, Luxury District, San Francisco, CA 94102",
    phone: contentSettings?.phone || "(555) 123-4567",
    email: "hello@serenitysalon.com",
    facebook: contentSettings?.facebookUrl || "#",
    instagram: contentSettings?.instagramUrl || "#",
    zalo: contentSettings?.zaloUrl || "#"
  };

  return (
    <footer className="bg-foreground text-background py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6" data-testid="footer-logo">
              <div className="w-10 h-10 luxury-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <span className="text-2xl font-serif font-bold text-primary">HOME BASE</span>
            </Link>
            <p className="text-background/80 mb-6 max-w-md" data-testid="footer-description">
              Your premier destination for luxury beauty services. Experience elegance in every detail with our professional nail, eyelash, and facial treatments.
            </p>
            <div className="flex space-x-4" data-testid="footer-social-links">
              <a 
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all"
                data-testid="footer-facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all"
                data-testid="footer-instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={contactInfo.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-all"
                data-testid="footer-zalo"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-serif font-bold text-background mb-4" data-testid="footer-quick-links-title">
              Quick Links
            </h4>
            <ul className="space-y-2 text-background/80" data-testid="footer-quick-links">
              <li>
                <Link href="/" className="hover:text-primary transition-colors" data-testid="footer-link-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors" data-testid="footer-link-services">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary transition-colors" data-testid="footer-link-gallery">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="footer-link-contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary transition-colors" data-testid="footer-link-booking">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-serif font-bold text-background mb-4" data-testid="footer-contact-info-title">
              Contact Info
            </h4>
            <div className="space-y-2 text-background/80 text-sm" data-testid="footer-contact-info">
              <p data-testid="footer-address">
                {contactInfo.address}
              </p>
              <p data-testid="footer-phone">
                Phone: {contactInfo.phone}
              </p>
              <p data-testid="footer-email">
                Email: {contactInfo.email}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm" data-testid="footer-copyright">
            © 2024 HOME BASE Beauty Salon. All rights reserved.
          </p>
          <div className="flex space-x-6 text-background/60 text-sm mt-4 md:mt-0" data-testid="footer-legal-links">
            <a href="#" className="hover:text-primary transition-colors" data-testid="footer-privacy">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors" data-testid="footer-terms">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
