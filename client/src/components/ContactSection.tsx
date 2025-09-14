import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Send,
  Mail
} from "lucide-react";

interface ContactSectionProps {
  contentSettings?: any;
}

export default function ContactSection({ contentSettings }: ContactSectionProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: ""
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest("POST", "/api/contact", messageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      // Reset form
      setFormData({
        name: "",
        phone: "",
        message: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and message.",
        variant: "destructive",
      });
      return;
    }

    createMessageMutation.mutate(formData);
  };

  const contactInfo = {
    address: contentSettings?.address || "Blk 483A Yishun Ave 6 Singapore 761483",
    phone: contentSettings?.phone || "+65 9712 1097",
    email: "kellybeautyhomebase@gmail.com",
    facebook: contentSettings?.facebookUrl || "#",
    instagram: contentSettings?.instagramUrl || "#",
    zalo: contentSettings?.zaloUrl || "#"
  };

  return (
    <section id="contact" className="py-20" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4" data-testid="contact-title">
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="contact-description">
            We'd love to hear from you and answer any questions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6" data-testid="visit-salon-title">
                Visit Our Salon
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4" data-testid="contact-address">
                  <div className="w-12 h-12 luxury-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground" data-testid="address-text">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="contact-phone">
                  <div className="w-12 h-12 luxury-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="phone-link"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4" data-testid="contact-email">
                  <div className="w-12 h-12 luxury-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="email-link"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4" data-testid="contact-hours">
                  <div className="w-12 h-12 luxury-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Opening Hours</p>
                    <div className="text-muted-foreground text-sm" data-testid="hours-text">
                      <p>Mon–Sun: 11:00AM – 7:00PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4" data-testid="follow-us-title">
                Follow Us
              </h3>
              <div className="flex space-x-4" data-testid="social-links">
                <a 
                  href={contactInfo.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all"
                  data-testid="link-facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href={contactInfo.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all"
                  data-testid="link-instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href={contactInfo.zalo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-all"
                  data-testid="link-zalo"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <Card className="shadow-lg" data-testid="contact-form-card">
              <CardHeader>
                <CardTitle className="text-2xl font-serif" data-testid="form-title">
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div>
                    <Label htmlFor="contactName" className="text-sm font-semibold text-foreground mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="contactName"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-contact-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone" className="text-sm font-semibold text-foreground mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      data-testid="input-contact-phone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactMessage" className="text-sm font-semibold text-foreground mb-2 block">
                      Message
                    </Label>
                    <Textarea
                      id="contactMessage"
                      rows={4}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      data-testid="textarea-contact-message"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={createMessageMutation.isPending}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all"
                    data-testid="button-send-contact-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
