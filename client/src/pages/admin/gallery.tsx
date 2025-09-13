import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react";
import type { UploadResult } from "@uppy/core";

export default function AdminGallery() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imageDialog, setImageDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageForm, setImageForm] = useState({
    url: "",
    category: "General",
    caption: "",
    order: "0"
  });

  useEffect(() => {
    document.title = "Gallery Management - Admin";
    
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

  const { data: images = [], error: imagesError } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (imagesError && isUnauthorizedError(imagesError as Error)) {
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
  }, [imagesError, toast]);

  const createImageMutation = useMutation({
    mutationFn: async (imageData: any) => {
      return apiRequest("POST", "/api/admin/gallery", imageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image added to gallery successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setImageDialog(false);
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
        description: error.message || "Failed to add image.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, ...imageData }: any) => {
      return apiRequest("PUT", `/api/admin/gallery/${id}`, imageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setImageDialog(false);
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
        description: error.message || "Failed to update image.",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
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
        description: error.message || "Failed to delete image.",
        variant: "destructive",
      });
    },
  });

  // Upload mutations for object storage
  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: { imageURL: string; category: string; caption: string; order: number }) => {
      return apiRequest("PUT", "/api/admin/gallery-upload", imageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image uploaded and added to gallery successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setImageDialog(false);
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
        description: error.message || "Failed to save uploaded image.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setImageForm({
      url: "",
      category: "General",
      caption: "",
      order: "0"
    });
    setEditingImage(null);
    setUploadedImageUrl("");
    setActiveTab("upload");
  };

  const openEditDialog = (image: any) => {
    setEditingImage(image);
    setImageForm({
      url: image.url,
      category: image.category,
      caption: image.caption || "",
      order: image.order?.toString() || "0"
    });
    setActiveTab("manual"); // Editing always uses manual mode
    setImageDialog(true);
  };

  // Handle getting upload parameters for ObjectUploader
  const handleGetUploadParameters = async () => {
    try {
      const response: any = await apiRequest("POST", "/api/objects/upload");
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle upload completion
  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setUploadedImageUrl((uploadedFile as any).uploadURL || '');
      toast({
        title: "Upload Complete",
        description: "File uploaded successfully! Fill in the details below to add it to your gallery.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For upload tab, check if we have an uploaded image
    if (activeTab === "upload" && !uploadedImageUrl) {
      toast({
        title: "Missing Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    // For manual tab or editing, check if we have a URL
    if (activeTab === "manual" && !imageForm.url.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide an image URL.",
        variant: "destructive",
      });
      return;
    }

    if (!imageForm.category || !imageForm.caption.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a category and caption.",
        variant: "destructive",
      });
      return;
    }

    const imageData = {
      ...imageForm,
      url: activeTab === "upload" ? uploadedImageUrl : imageForm.url,
      order: parseInt(imageForm.order) || 0
    };

    if (editingImage) {
      updateImageMutation.mutate({ id: editingImage.id, ...imageData });
    } else if (activeTab === "upload") {
      // Use the upload endpoint for uploaded files
      uploadImageMutation.mutate({
        imageURL: uploadedImageUrl,
        category: imageForm.category,
        caption: imageForm.caption,
        order: parseInt(imageForm.order) || 0
      });
    } else {
      // Use the regular endpoint for manual URLs
      createImageMutation.mutate(imageData);
    }
  };

  const categories = ["General", "Nail", "Eyelash", "Facial"];
  
  const filteredImages = categoryFilter === "all" 
    ? images 
    : images.filter((image: any) => image.category === categoryFilter);

  if (isLoading || (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
            <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="gallery-title">
              Gallery Management
            </h1>
            <p className="text-muted-foreground" data-testid="gallery-description">
              Manage your salon's photo gallery
            </p>
          </div>
          <Dialog open={imageDialog} onOpenChange={setImageDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-add-image">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="image-dialog">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">
                  {editingImage ? "Edit Image" : "Add New Image"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {!editingImage && (
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" data-testid="tab-upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="manual" data-testid="tab-manual">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Manual URL
                    </TabsTrigger>
                  </TabsList>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="image-form">
                  <TabsContent value="upload" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">
                          Upload Image *
                        </Label>
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760} // 10MB
                          onGetUploadParameters={handleGetUploadParameters}
                          onComplete={handleUploadComplete}
                          buttonClassName="w-full h-32 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                            <Upload className="w-8 h-8" />
                            <div className="text-center">
                              <p className="text-sm font-medium">Upload an image</p>
                              <p className="text-xs">PNG, JPG up to 10MB</p>
                            </div>
                          </div>
                        </ObjectUploader>
                        
                        {uploadedImageUrl && (
                          <div className="mt-4">
                            <Label className="text-sm font-semibold mb-2 block">Upload Preview</Label>
                            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={uploadedImageUrl} 
                                alt="Uploaded preview" 
                                className="w-full h-full object-cover"
                                data-testid="upload-preview"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-6 mt-6">
                    <div>
                      <Label htmlFor="url" className="text-sm font-semibold mb-2 block">
                        Image URL *
                      </Label>
                      <Input
                        id="url"
                        value={imageForm.url}
                        onChange={(e) => setImageForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-url"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a direct URL to the image file
                      </p>
                    </div>
                  </TabsContent>

                  {/* Shared form fields for both tabs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-sm font-semibold mb-2 block">
                        Category *
                      </Label>
                      <Select 
                        value={imageForm.category} 
                        onValueChange={(value) => setImageForm(prev => ({ ...prev, category: value }))}
                        data-testid="select-category"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} data-testid={`category-option-${category.toLowerCase()}`}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="order" className="text-sm font-semibold mb-2 block">
                        Display Order
                      </Label>
                      <Input
                        id="order"
                        type="number"
                        value={imageForm.order}
                        onChange={(e) => setImageForm(prev => ({ ...prev, order: e.target.value }))}
                        placeholder="0"
                        data-testid="input-order"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caption" className="text-sm font-semibold mb-2 block">
                      Caption *
                    </Label>
                    <Input
                      id="caption"
                      value={imageForm.caption}
                      onChange={(e) => setImageForm(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="Describe what's shown in this image"
                      data-testid="input-caption"
                    />
                  </div>

                  {/* Manual URL preview - only show for manual tab and when URL exists */}
                  {activeTab === "manual" && imageForm.url && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Preview</Label>
                      <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={imageForm.url} 
                          alt="Manual URL preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          data-testid="manual-preview"
                        />
                      </div>
                    </div>
                  )}

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setImageDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createImageMutation.isPending || updateImageMutation.isPending}
                    data-testid="button-save"
                  >
                    {editingImage ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <Label className="text-sm font-semibold">Filter by category:</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter} data-testid="category-filter">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} data-testid={`filter-${category.toLowerCase()}`}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="images-grid">
          {filteredImages.map((image: any) => (
            <Card key={image.id} className="hover-lift overflow-hidden" data-testid={`image-card-${image.id}`}>
              <div className="relative aspect-square">
                <img 
                  src={image.url} 
                  alt={image.caption || 'Gallery image'} 
                  className="w-full h-full object-cover"
                  data-testid={`image-${image.id}`}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" data-testid={`image-category-${image.id}`}>
                    {image.category}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {image.caption && (
                        <p className="text-white text-sm font-medium truncate" data-testid={`image-caption-${image.id}`}>
                          {image.caption}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => openEditDialog(image)}
                        data-testid={`button-edit-${image.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="bg-red-600/80 hover:bg-red-600"
                            data-testid={`button-delete-${image.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-testid={`delete-dialog-${image.id}`}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid={`cancel-delete-${image.id}`}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`confirm-delete-${image.id}`}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <Card className="text-center py-12" data-testid="no-images-card">
            <CardContent>
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4" data-testid="no-images-text">
                {categoryFilter === "all" 
                  ? "No images in gallery. Add your first image to get started." 
                  : `No images found in the ${categoryFilter} category.`}
              </p>
              <Button onClick={() => setImageDialog(true)} data-testid="button-add-first-image">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
