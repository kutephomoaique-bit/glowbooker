import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertStaffSchema, insertStaffAvailabilitySchema, type Staff, type Service, type StaffAvailability } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, Trash2, User, Clock, Briefcase, Mail, Phone, Camera, Calendar } from "lucide-react";

type StaffWithDetails = Staff & { 
  availability: StaffAvailability[], 
  services: { id: string; service: Service }[] 
};

// Day mapping for display
const dayNames = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday", 
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday"
};

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const staffFormSchema = insertStaffSchema.extend({
  skills: z.array(z.string()).optional()
});

const availabilityFormSchema = insertStaffAvailabilitySchema;

export default function AdminStaff() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<StaffWithDetails | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Staff form
  const staffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      position: "",
      bio: "",
      profileImageUrl: "",
      experienceYears: 0,
      isActive: true,
      skills: []
    }
  });

  // Availability form
  const availabilityForm = useForm<z.infer<typeof availabilityFormSchema>>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      staffId: "",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true
    }
  });

  // Queries
  const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['/api/admin/staff']
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services']
  });

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: (data: z.infer<typeof staffFormSchema>) => 
      apiRequest('POST', '/api/admin/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Staff member created successfully" });
      setIsStaffDialogOpen(false);
      staffForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create staff member", variant: "destructive" });
    }
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<z.infer<typeof staffFormSchema>> }) =>
      apiRequest('PUT', `/api/admin/staff/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Staff member updated successfully" });
      setIsStaffDialogOpen(false);
      setIsEditMode(false);
      staffForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update staff member", variant: "destructive" });
    }
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Staff member deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete staff member", variant: "destructive" });
    }
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: (data: z.infer<typeof availabilityFormSchema>) =>
      apiRequest('POST', '/api/admin/staff/availability', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Availability added successfully" });
      setIsAvailabilityDialogOpen(false);
      availabilityForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add availability", variant: "destructive" });
    }
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/staff/availability/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Availability removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove availability", variant: "destructive" });
    }
  });

  const assignServiceMutation = useMutation({
    mutationFn: ({ staffId, serviceId }: { staffId: string, serviceId: string }) =>
      apiRequest('POST', `/api/admin/staff/${staffId}/services/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Service assigned successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign service", variant: "destructive" });
    }
  });

  const removeServiceMutation = useMutation({
    mutationFn: ({ staffId, serviceId }: { staffId: string, serviceId: string }) =>
      apiRequest('DELETE', `/api/admin/staff/${staffId}/services/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "Success", description: "Service removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove service", variant: "destructive" });
    }
  });

  const handleEditStaff = (staffMember: StaffWithDetails) => {
    setSelectedStaff(staffMember);
    setIsEditMode(true);
    staffForm.reset({
      name: staffMember.name,
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      position: staffMember.position || "",
      bio: staffMember.bio || "",
      profileImageUrl: staffMember.profileImageUrl || "",
      experienceYears: staffMember.experienceYears || 0,
      isActive: staffMember.isActive,
      skills: staffMember.skills || []
    });
    setIsStaffDialogOpen(true);
  };

  const handleAddAvailability = (staffMember: StaffWithDetails) => {
    setSelectedStaff(staffMember);
    availabilityForm.reset({
      staffId: staffMember.id,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true
    });
    setIsAvailabilityDialogOpen(true);
  };

  const onStaffSubmit = (data: z.infer<typeof staffFormSchema>) => {
    if (isEditMode && selectedStaff) {
      updateStaffMutation.mutate({ id: selectedStaff.id, data });
    } else {
      createStaffMutation.mutate(data);
    }
  };

  const onAvailabilitySubmit = (data: z.infer<typeof availabilityFormSchema>) => {
    createAvailabilityMutation.mutate(data);
  };

  if (isLoadingStaff) {
    return <div className="p-6">Loading staff...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage staff members, their availability, and service specializations</p>
        </div>
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setIsEditMode(false);
                staffForm.reset();
              }}
              data-testid="button-add-staff"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            </DialogHeader>
            <Form {...staffForm}>
              <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                <FormField
                  control={staffForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-staff-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-staff-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={staffForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-staff-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={staffForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Senior Nail Technician" data-testid="input-staff-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={staffForm.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-staff-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={staffForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="textarea-staff-bio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={staffForm.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-staff-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={staffForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-staff-active"
                        />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsStaffDialogOpen(false)}
                    data-testid="button-cancel-staff"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                    data-testid="button-save-staff"
                  >
                    {isEditMode ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {staff.map((staffMember: StaffWithDetails) => (
          <Card key={staffMember.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {staffMember.profileImageUrl ? (
                      <img 
                        src={staffMember.profileImageUrl} 
                        alt={staffMember.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold" data-testid={`text-staff-name-${staffMember.id}`}>
                        {staffMember.name}
                      </h3>
                      <Badge variant={staffMember.isActive ? "default" : "secondary"}>
                        {staffMember.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {staffMember.position && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{staffMember.position}</p>
                    )}
                    {staffMember.experienceYears && (
                      <p className="text-sm text-gray-500">{staffMember.experienceYears} years experience</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditStaff(staffMember)}
                    data-testid={`button-edit-staff-${staffMember.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteStaffMutation.mutate(staffMember.id)}
                    disabled={deleteStaffMutation.isPending}
                    data-testid={`button-delete-staff-${staffMember.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffMember.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{staffMember.email}</span>
                  </div>
                )}
                {staffMember.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{staffMember.phone}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {staffMember.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{staffMember.bio}</p>
                </div>
              )}

              <Separator />

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Services ({staffMember.services.length})
                  </h4>
                  <Select onValueChange={(serviceId) => 
                    assignServiceMutation.mutate({ staffId: staffMember.id, serviceId })
                  }>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services
                        .filter((service: Service) => 
                          !staffMember.services.some(s => s.service.id === service.id)
                        )
                        .map((service: Service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staffMember.services.map((staffService) => (
                    <Badge 
                      key={staffService.id} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeServiceMutation.mutate({ 
                        staffId: staffMember.id, 
                        serviceId: staffService.service.id 
                      })}
                      data-testid={`badge-service-${staffService.service.id}`}
                    >
                      {staffService.service.name}
                      <Trash2 className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {staffMember.services.length === 0 && (
                    <p className="text-sm text-gray-500">No services assigned</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Availability */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Availability ({staffMember.availability.length})
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddAvailability(staffMember)}
                    data-testid={`button-add-availability-${staffMember.id}`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Hours
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {staffMember.availability.map((availability) => (
                    <div 
                      key={availability.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {dayNames[availability.dayOfWeek as keyof typeof dayNames]}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {availability.startTime} - {availability.endTime}
                        </span>
                        <Badge variant={availability.isActive ? "default" : "secondary"} className="text-xs">
                          {availability.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAvailabilityMutation.mutate(availability.id)}
                        disabled={deleteAvailabilityMutation.isPending}
                        data-testid={`button-delete-availability-${availability.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {staffMember.availability.length === 0 && (
                    <p className="text-sm text-gray-500 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      No availability set
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Availability Dialog */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
          </DialogHeader>
          <Form {...availabilityForm}>
            <form onSubmit={availabilityForm.handleSubmit(onAvailabilitySubmit)} className="space-y-4">
              <FormField
                control={availabilityForm.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-day">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(dayNames).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={availabilityForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-start-time">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={availabilityForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-end-time">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={availabilityForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-availability-active"
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAvailabilityDialogOpen(false)}
                  data-testid="button-cancel-availability"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAvailabilityMutation.isPending}
                  data-testid="button-save-availability"
                >
                  Add Availability
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}