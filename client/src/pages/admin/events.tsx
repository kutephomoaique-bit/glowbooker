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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit, Trash2, Star, CalendarIcon, Percent, DollarSign, Target } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminEvents() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [promoDialog, setPromoDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    discountType: "PERCENT",
    value: "",
    startAt: undefined as Date | undefined,
    endAt: undefined as Date | undefined,
    scopeType: "GLOBAL",
    scopeId: "",
    isActive: true
  });

  useEffect(() => {
    document.title = "Events & Promotions - Admin";
    
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

  const { data: promotions = [], error: promotionsError } = useQuery({
    queryKey: ["/api/admin/event-promos"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  const { data: services = [], error: servicesError } = useQuery({
    queryKey: ["/api/services"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ["/api/service-categories"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [promotionsError, servicesError, categoriesError].filter(Boolean);
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
  }, [promotionsError, servicesError, categoriesError, toast]);

  const createPromoMutation = useMutation({
    mutationFn: async (promoData: any) => {
      return apiRequest("POST", "/api/admin/event-promos", promoData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promotion created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-promos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setPromoDialog(false);
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
        description: error.message || "Failed to create promotion.",
        variant: "destructive",
      });
    },
  });

  const updatePromoMutation = useMutation({
    mutationFn: async ({ id, ...promoData }: any) => {
      return apiRequest("PUT", `/api/admin/event-promos/${id}`, promoData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promotion updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-promos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setPromoDialog(false);
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
        description: error.message || "Failed to update promotion.",
        variant: "destructive",
      });
    },
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/event-promos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Promotion deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-promos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
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
        description: error.message || "Failed to delete promotion.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPromoForm({
      title: "",
      description: "",
      discountType: "PERCENT",
      value: "",
      startAt: undefined,
      endAt: undefined,
      scopeType: "GLOBAL",
      scopeId: "",
      isActive: true
    });
    setEditingPromo(null);
  };

  const openEditDialog = (promo: any) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title,
      description: promo.description || "",
      discountType: promo.discountType,
      value: promo.value,
      startAt: new Date(promo.startAt),
      endAt: new Date(promo.endAt),
      scopeType: promo.scopeType,
      scopeId: promo.scopeId || "",
      isActive: promo.isActive
    });
    setPromoDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoForm.title.trim() || !promoForm.value || !promoForm.startAt || !promoForm.endAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (promoForm.endAt <= promoForm.startAt) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    const promoData = {
      title: promoForm.title.trim(),
      description: promoForm.description.trim() || null,
      discountType: promoForm.discountType,
      value: parseFloat(promoForm.value),
      startAt: promoForm.startAt.toISOString(),
      endAt: promoForm.endAt.toISOString(),
      scopeType: promoForm.scopeType,
      scopeId: promoForm.scopeId || null,
      isActive: promoForm.isActive
    };

    if (editingPromo) {
      updatePromoMutation.mutate({ id: editingPromo.id, ...promoData });
    } else {
      createPromoMutation.mutate(promoData);
    }
  };

  const getStatusColor = (promo: any) => {
    const now = new Date();
    const startDate = new Date(promo.startAt);
    const endDate = new Date(promo.endAt);

    if (!promo.isActive) return 'bg-gray-100 text-gray-800';
    if (now < startDate) return 'bg-blue-100 text-blue-800';
    if (now > endDate) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (promo: any) => {
    const now = new Date();
    const startDate = new Date(promo.startAt);
    const endDate = new Date(promo.endAt);

    if (!promo.isActive) return 'Inactive';
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  const getScopeText = (promo: any) => {
    if (promo.scopeType === 'GLOBAL') return 'All Services';
    if (promo.scopeType === 'CATEGORY') {
      const category = categories.find((c: any) => c.id === promo.scopeId);
      return category ? `${category.name} Services` : 'Category';
    }
    if (promo.scopeType === 'SERVICE') {
      const service = services.find((s: any) => s.id === promo.scopeId);
      return service ? service.name : 'Specific Service';
    }
    return 'Unknown';
  };

  const formatDiscountValue = (promo: any) => {
    if (promo.discountType === 'PERCENT') {
      return `${parseFloat(promo.value)}% OFF`;
    } else {
      return `$${parseFloat(promo.value)} OFF`;
    }
  };

  const activePromotions = promotions.filter((promo: any) => {
    const now = new Date();
    const startDate = new Date(promo.startAt);
    const endDate = new Date(promo.endAt);
    return promo.isActive && now >= startDate && now <= endDate;
  });

  const scheduledPromotions = promotions.filter((promo: any) => {
    const now = new Date();
    const startDate = new Date(promo.startAt);
    return promo.isActive && now < startDate;
  });

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
            <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="events-title">
              Events & Promotions
            </h1>
            <p className="text-muted-foreground" data-testid="events-description">
              Manage promotional campaigns and discount events
            </p>
          </div>
          <Dialog open={promoDialog} onOpenChange={setPromoDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-promotion">
                <Plus className="w-4 h-4 mr-2" />
                Create Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl" data-testid="promotion-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">
                  {editingPromo ? "Edit Promotion" : "Create New Promotion"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="promotion-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-semibold mb-2 block">
                      Promotion Title *
                    </Label>
                    <Input
                      id="title"
                      value={promoForm.title}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter promotion title"
                      data-testid="input-title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discountType" className="text-sm font-semibold mb-2 block">
                      Discount Type *
                    </Label>
                    <Select 
                      value={promoForm.discountType} 
                      onValueChange={(value) => setPromoForm(prev => ({ ...prev, discountType: value }))}
                      data-testid="select-discount-type"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT" data-testid="discount-type-percent">
                          <div className="flex items-center space-x-2">
                            <Percent className="w-4 h-4" />
                            <span>Percentage</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="AMOUNT" data-testid="discount-type-amount">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Fixed Amount</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Promotion description"
                    rows={3}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="value" className="text-sm font-semibold mb-2 block">
                      Discount Value *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={promoForm.discountType === 'PERCENT' ? "1" : "0.01"}
                      value={promoForm.value}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={promoForm.discountType === 'PERCENT' ? "20" : "10.00"}
                      data-testid="input-value"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {promoForm.discountType === 'PERCENT' ? 'Percentage (1-100)' : 'Dollar amount'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Start Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !promoForm.startAt && "text-muted-foreground"
                          )}
                          data-testid="start-date-picker-trigger"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {promoForm.startAt ? format(promoForm.startAt, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" data-testid="start-date-picker-content">
                        <Calendar
                          mode="single"
                          selected={promoForm.startAt}
                          onSelect={(date) => setPromoForm(prev => ({ ...prev, startAt: date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      End Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !promoForm.endAt && "text-muted-foreground"
                          )}
                          data-testid="end-date-picker-trigger"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {promoForm.endAt ? format(promoForm.endAt, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" data-testid="end-date-picker-content">
                        <Calendar
                          mode="single"
                          selected={promoForm.endAt}
                          onSelect={(date) => setPromoForm(prev => ({ ...prev, endAt: date }))}
                          disabled={(date) => date < (promoForm.startAt || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scopeType" className="text-sm font-semibold mb-2 block">
                      Apply To *
                    </Label>
                    <Select 
                      value={promoForm.scopeType} 
                      onValueChange={(value) => setPromoForm(prev => ({ ...prev, scopeType: value, scopeId: "" }))}
                      data-testid="select-scope-type"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GLOBAL" data-testid="scope-type-global">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4" />
                            <span>All Services</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CATEGORY" data-testid="scope-type-category">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Service Category</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="SERVICE" data-testid="scope-type-service">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Specific Service</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {promoForm.scopeType === 'CATEGORY' && (
                    <div>
                      <Label htmlFor="scopeId" className="text-sm font-semibold mb-2 block">
                        Select Category *
                      </Label>
                      <Select 
                        value={promoForm.scopeId} 
                        onValueChange={(value) => setPromoForm(prev => ({ ...prev, scopeId: value }))}
                        data-testid="select-category"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id} data-testid={`category-option-${category.id}`}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {promoForm.scopeType === 'SERVICE' && (
                    <div>
                      <Label htmlFor="scopeId" className="text-sm font-semibold mb-2 block">
                        Select Service *
                      </Label>
                      <Select 
                        value={promoForm.scopeId} 
                        onValueChange={(value) => setPromoForm(prev => ({ ...prev, scopeId: value }))}
                        data-testid="select-service"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service: any) => (
                            <SelectItem key={service.id} value={service.id} data-testid={`service-option-${service.id}`}>
                              {service.name} ({[
                                service.isNail && "Nail",
                                service.isEyelash && "Eyelash", 
                                service.isFacial && "Facial"
                              ].filter(Boolean).join(", ") || "General"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-border"
                    data-testid="checkbox-active"
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Promotion is active
                  </Label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPromoDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPromoMutation.isPending || updatePromoMutation.isPending}
                    data-testid="button-save"
                  >
                    {editingPromo ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stat-total-promotions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-promotions-count">
                {promotions.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-promotions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="active-promotions-count">
                {activePromotions.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-scheduled-promotions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="scheduled-promotions-count">
                {scheduledPromotions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="promotions-grid">
          {promotions.map((promo: any) => (
            <Card key={promo.id} className="hover-lift" data-testid={`promotion-card-${promo.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`promotion-title-${promo.id}`}>
                      {promo.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground" data-testid={`promotion-scope-${promo.id}`}>
                      {getScopeText(promo)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(promo)} data-testid={`promotion-status-${promo.id}`}>
                    {getStatusText(promo)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`promotion-description-${promo.id}`}>
                      {promo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1" data-testid={`promotion-discount-${promo.id}`}>
                      {promo.discountType === 'PERCENT' ? (
                        <Percent className="w-4 h-4 text-primary" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-semibold text-lg">{formatDiscountValue(promo)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-1" data-testid={`promotion-dates-${promo.id}`}>
                      <CalendarIcon className="w-3 h-3" />
                      <span>
                        {format(new Date(promo.startAt), 'MMM dd')} - {format(new Date(promo.endAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(promo)}
                    data-testid={`button-edit-${promo.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" data-testid={`button-delete-${promo.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-testid={`delete-dialog-${promo.id}`}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{promo.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid={`cancel-delete-${promo.id}`}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePromoMutation.mutate(promo.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid={`confirm-delete-${promo.id}`}
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

        {promotions.length === 0 && (
          <Card className="text-center py-12" data-testid="no-promotions-card">
            <CardContent>
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4" data-testid="no-promotions-text">
                No promotions found. Create your first promotion to boost sales.
              </p>
              <Button onClick={() => setPromoDialog(true)} data-testid="button-create-first-promotion">
                <Plus className="w-4 h-4 mr-2" />
                Create First Promotion
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
