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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit, Trash2, DollarSign, Clock } from "lucide-react";

export default function AdminServices() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [serviceDialog, setServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    durationMins: "",
    isNail: false,
    isEyelash: false,
    isFacial: false,
    isActive: true
  });

  useEffect(() => {
    document.title = "Services Management - Admin";
    
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

  const { data: services = [], error: servicesError } = useQuery<any[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [servicesError].filter(Boolean);
    for (const error of errors) {
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
    }
  }, [servicesError, toast]);

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const formattedData = {
        ...serviceData,
        basePrice: serviceData.basePrice.toString(),
        durationMins: parseInt(serviceData.durationMins)
      };
      return apiRequest("POST", "/api/admin/services", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setServiceDialog(false);
      resetForm();
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
        description: error.message || "Failed to create service.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...serviceData }: any) => {
      const formattedData = {
        ...serviceData,
        basePrice: serviceData.basePrice.toString(),
        durationMins: parseInt(serviceData.durationMins)
      };
      return apiRequest("PUT", `/api/admin/services/${id}`, formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setServiceDialog(false);
      resetForm();
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
        description: error.message || "Failed to update service.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
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
        description: error.message || "Failed to delete service.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setServiceForm({
      name: "",
      slug: "",
      description: "",
      basePrice: "",
      durationMins: "",
      isNail: false,
      isEyelash: false,
      isFacial: false,
      isActive: true
    });
    setEditingService(null);
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      slug: service.slug,
      description: service.description || "",
      basePrice: service.basePrice,
      durationMins: service.durationMins.toString(),
      isNail: service.isNail || false,
      isEyelash: service.isEyelash || false,
      isFacial: service.isFacial || false,
      isActive: service.isActive
    });
    setServiceDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.name || !serviceForm.basePrice || !serviceForm.durationMins || (!serviceForm.isNail && !serviceForm.isEyelash && !serviceForm.isFacial)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one category.",
        variant: "destructive",
      });
      return;
    }

    const serviceData = {
      ...serviceForm,
      basePrice: parseFloat(serviceForm.basePrice),
      durationMins: parseInt(serviceForm.durationMins),
      slug: serviceForm.slug || serviceForm.name.toLowerCase().replace(/\s+/g, '-')
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  if (isLoading || (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="services-title">
              Services Management
            </h1>
            <p className="text-muted-foreground" data-testid="services-description">
              Manage your salon services and pricing
            </p>
          </div>
          <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-service">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="service-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="service-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Categories *
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isNail"
                          checked={serviceForm.isNail}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, isNail: e.target.checked }))}
                          className="rounded border-border"
                          data-testid="checkbox-nail"
                        />
                        <Label htmlFor="isNail" className="text-sm">
                          Nail
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isEyelash"
                          checked={serviceForm.isEyelash}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, isEyelash: e.target.checked }))}
                          className="rounded border-border"
                          data-testid="checkbox-eyelash"
                        />
                        <Label htmlFor="isEyelash" className="text-sm">
                          Eyelash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isFacial"
                          checked={serviceForm.isFacial}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, isFacial: e.target.checked }))}
                          className="rounded border-border"
                          data-testid="checkbox-facial"
                        />
                        <Label htmlFor="isFacial" className="text-sm">
                          Facial
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                      Service Name *
                    </Label>
                    <Input
                      id="name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter service name"
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Service description"
                    rows={3}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice" className="text-sm font-semibold mb-2 block">
                      Base Price ($) *
                    </Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={serviceForm.basePrice}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      placeholder="0.00"
                      data-testid="input-base-price"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="durationMins" className="text-sm font-semibold mb-2 block">
                      Duration (minutes) *
                    </Label>
                    <Input
                      id="durationMins"
                      type="number"
                      value={serviceForm.durationMins}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, durationMins: e.target.value }))}
                      placeholder="60"
                      data-testid="input-duration"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={serviceForm.isActive}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-border"
                    data-testid="checkbox-active"
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Service is active
                  </Label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setServiceDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    data-testid="button-save"
                  >
                    {editingService ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="services-grid">
          {services.map((service: any) => (
            <Card key={service.id} className="hover-lift" data-testid={`service-card-${service.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`service-name-${service.id}`}>
                      {service.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground" data-testid={`service-category-${service.id}`}>
                      {service.category.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={service.isActive ? "default" : "secondary"} data-testid={`service-status-${service.id}`}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`service-description-${service.id}`}>
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1" data-testid={`service-price-${service.id}`}>
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold">${parseFloat(service.basePrice).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-1" data-testid={`service-duration-${service.id}`}>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{service.durationMins} mins</span>
                    </div>
                  </div>

                  {service.hasDiscount && (
                    <Badge variant="secondary" className="w-full justify-center" data-testid={`service-discount-${service.id}`}>
                      On Sale: ${service.effectivePrice?.toFixed(2)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(service)}
                    data-testid={`button-edit-${service.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" data-testid={`button-delete-${service.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-testid={`delete-dialog-${service.id}`}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{service.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid={`cancel-delete-${service.id}`}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid={`confirm-delete-${service.id}`}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card className="text-center py-12" data-testid="no-services-card">
            <CardContent>
              <p className="text-muted-foreground mb-4" data-testid="no-services-text">
                No services found. Create your first service to get started.
              </p>
              <Button onClick={() => setServiceDialog(true)} data-testid="button-create-first-service">
                <Plus className="w-4 h-4 mr-2" />
                Create First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
