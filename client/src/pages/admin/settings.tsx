import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Settings as SettingsIcon, 
  Save, 
  MapPin, 
  Phone, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Plus, 
  X,
  Globe,
  Clock
} from "lucide-react";

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settingsForm, setSettingsForm] = useState({
    slogans: [""],
    address: "",
    facebookUrl: "",
    zaloUrl: "",
    instagramUrl: "",
    phone: "",
    openingHours: {
      monday: { open: "09:00", close: "19:00", closed: false },
      tuesday: { open: "09:00", close: "19:00", closed: false },
      wednesday: { open: "09:00", close: "19:00", closed: false },
      thursday: { open: "09:00", close: "19:00", closed: false },
      friday: { open: "09:00", close: "19:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "10:00", close: "17:00", closed: false }
    },
    heroImages: [""],
    seo: {
      title: "",
      description: "",
      keywords: ""
    }
  });

  useEffect(() => {
    document.title = "Settings - Admin";
    
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: contentSettings, error: settingsError } = useQuery({
    queryKey: ["/api/content-settings"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Load existing settings when data is available
  useEffect(() => {
    if (contentSettings) {
      setSettingsForm({
        slogans: contentSettings.slogans?.length > 0 ? contentSettings.slogans : [""],
        address: contentSettings.address || "",
        facebookUrl: contentSettings.facebookUrl || "",
        zaloUrl: contentSettings.zaloUrl || "",
        instagramUrl: contentSettings.instagramUrl || "",
        phone: contentSettings.phone || "",
        openingHours: contentSettings.openingHours || {
          monday: { open: "09:00", close: "19:00", closed: false },
          tuesday: { open: "09:00", close: "19:00", closed: false },
          wednesday: { open: "09:00", close: "19:00", closed: false },
          thursday: { open: "09:00", close: "19:00", closed: false },
          friday: { open: "09:00", close: "19:00", closed: false },
          saturday: { open: "09:00", close: "18:00", closed: false },
          sunday: { open: "10:00", close: "17:00", closed: false }
        },
        heroImages: contentSettings.heroImages?.length > 0 ? contentSettings.heroImages : [""],
        seo: contentSettings.seo || {
          title: "",
          description: "",
          keywords: ""
        }
      });
    }
  }, [contentSettings]);

  // Handle unauthorized errors
  useEffect(() => {
    if (settingsError && isUnauthorizedError(settingsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "Admin session expired. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [settingsError, toast]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      return apiRequest("PUT", "/api/admin/content-settings", settingsData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content-settings"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "Admin session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settingsData = {
      ...settingsForm,
      slogans: settingsForm.slogans.filter(slogan => slogan.trim() !== ""),
      heroImages: settingsForm.heroImages.filter(url => url.trim() !== "")
    };

    updateSettingsMutation.mutate(settingsData);
  };

  const addSlogan = () => {
    setSettingsForm(prev => ({
      ...prev,
      slogans: [...prev.slogans, ""]
    }));
  };

  const removeSlogan = (index: number) => {
    setSettingsForm(prev => ({
      ...prev,
      slogans: prev.slogans.filter((_, i) => i !== index)
    }));
  };

  const updateSlogan = (index: number, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      slogans: prev.slogans.map((slogan, i) => i === index ? value : slogan)
    }));
  };

  const addHeroImage = () => {
    setSettingsForm(prev => ({
      ...prev,
      heroImages: [...prev.heroImages, ""]
    }));
  };

  const removeHeroImage = (index: number) => {
    setSettingsForm(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index)
    }));
  };

  const updateHeroImage = (index: number, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      heroImages: prev.heroImages.map((url, i) => i === index ? value : url)
    }));
  };

  const updateOpeningHours = (day: string, field: string, value: string | boolean) => {
    setSettingsForm(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day as keyof typeof prev.openingHours],
          [field]: value
        }
      }
    }));
  };

  const updateSeo = (field: string, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  if (isLoading || (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground" data-testid="settings-description">
            Manage your salon's content and configuration settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" data-testid="settings-form">
          {/* Brand & Slogans */}
          <Card data-testid="brand-settings-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <span>Brand & Slogans</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Salon Slogans
                </Label>
                <div className="space-y-3">
                  {settingsForm.slogans.map((slogan, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={slogan}
                        onChange={(e) => updateSlogan(index, e.target.value)}
                        placeholder="Enter a slogan"
                        data-testid={`input-slogan-${index}`}
                      />
                      {settingsForm.slogans.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSlogan(index)}
                          data-testid={`button-remove-slogan-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSlogan}
                    className="w-full"
                    data-testid="button-add-slogan"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slogan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card data-testid="contact-settings-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-primary" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold mb-2 block">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Beauty Street, City, State 12345"
                    rows={2}
                    data-testid="textarea-address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card data-testid="social-settings-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>Social Media Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facebookUrl" className="text-sm font-semibold mb-2 block flex items-center space-x-2">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </Label>
                  <Input
                    id="facebookUrl"
                    value={settingsForm.facebookUrl}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebookUrl: e.target.value }))}
                    placeholder="https://facebook.com/your-page"
                    data-testid="input-facebook"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagramUrl" className="text-sm font-semibold mb-2 block flex items-center space-x-2">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </Label>
                  <Input
                    id="instagramUrl"
                    value={settingsForm.instagramUrl}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="https://instagram.com/your-account"
                    data-testid="input-instagram"
                  />
                </div>
                
                <div>
                  <Label htmlFor="zaloUrl" className="text-sm font-semibold mb-2 block flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Zalo</span>
                  </Label>
                  <Input
                    id="zaloUrl"
                    value={settingsForm.zaloUrl}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, zaloUrl: e.target.value }))}
                    placeholder="https://zalo.me/your-account"
                    data-testid="input-zalo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card data-testid="hours-settings-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Opening Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => {
                const dayHours = settingsForm.openingHours[day.key as keyof typeof settingsForm.openingHours];
                return (
                  <div key={day.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center" data-testid={`hours-${day.key}`}>
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium min-w-[80px]">{day.label}</Label>
                    </div>
                    
                    {!dayHours.closed ? (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Open</Label>
                          <Input
                            type="time"
                            value={dayHours.open}
                            onChange={(e) => updateOpeningHours(day.key, 'open', e.target.value)}
                            data-testid={`input-${day.key}-open`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Close</Label>
                          <Input
                            type="time"
                            value={dayHours.close}
                            onChange={(e) => updateOpeningHours(day.key, 'close', e.target.value)}
                            data-testid={`input-${day.key}-close`}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center">
                        <Badge variant="secondary">Closed</Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${day.key}-closed`}
                        checked={dayHours.closed}
                        onChange={(e) => updateOpeningHours(day.key, 'closed', e.target.checked)}
                        className="rounded border-border"
                        data-testid={`checkbox-${day.key}-closed`}
                      />
                      <Label htmlFor={`${day.key}-closed`} className="text-sm">
                        Closed
                      </Label>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Hero Images */}
          <Card data-testid="hero-settings-card">
            <CardHeader>
              <CardTitle>Hero Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Hero Section Images
                </Label>
                <div className="space-y-3">
                  {settingsForm.heroImages.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={url}
                        onChange={(e) => updateHeroImage(index, e.target.value)}
                        placeholder="https://example.com/hero-image.jpg"
                        data-testid={`input-hero-image-${index}`}
                      />
                      {settingsForm.heroImages.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeHeroImage(index)}
                          data-testid={`button-remove-hero-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHeroImage}
                    className="w-full"
                    data-testid="button-add-hero-image"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hero Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card data-testid="seo-settings-card">
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle" className="text-sm font-semibold mb-2 block">
                  Site Title
                </Label>
                <Input
                  id="seoTitle"
                  value={settingsForm.seo.title}
                  onChange={(e) => updateSeo('title', e.target.value)}
                  placeholder="Serenity Beauty Salon - Luxury Nail, Eyelash & Facial Services"
                  data-testid="input-seo-title"
                />
              </div>
              
              <div>
                <Label htmlFor="seoDescription" className="text-sm font-semibold mb-2 block">
                  Meta Description
                </Label>
                <Textarea
                  id="seoDescription"
                  value={settingsForm.seo.description}
                  onChange={(e) => updateSeo('description', e.target.value)}
                  placeholder="Experience luxury beauty services with our expert team. Specializing in premium nail care, eyelash extensions, and rejuvenating facial treatments."
                  rows={3}
                  data-testid="textarea-seo-description"
                />
              </div>
              
              <div>
                <Label htmlFor="seoKeywords" className="text-sm font-semibold mb-2 block">
                  Keywords
                </Label>
                <Input
                  id="seoKeywords"
                  value={settingsForm.seo.keywords}
                  onChange={(e) => updateSeo('keywords', e.target.value)}
                  placeholder="beauty salon, nail care, eyelash extensions, facial treatments, luxury spa"
                  data-testid="input-seo-keywords"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
