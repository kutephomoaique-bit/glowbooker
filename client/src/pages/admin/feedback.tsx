import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Eye,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

export default function AdminFeedback() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Feedback Management - Admin";
    
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

  const { data: allFeedback = [], error: feedbackError } = useQuery({
    queryKey: ["/api/admin/feedback"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  const { data: pendingFeedback = [], error: pendingError } = useQuery({
    queryKey: ["/api/admin/feedback/pending"],
    enabled: isAuthenticated && user?.role === 'ADMIN',
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const errors = [feedbackError, pendingError].filter(Boolean);
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
  }, [feedbackError, pendingError, toast]);

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, ...feedbackData }: any) => {
      return apiRequest("PUT", `/api/admin/feedback/${id}`, feedbackData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
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
        description: error.message || "Failed to update feedback.",
        variant: "destructive",
      });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/feedback/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
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
        description: error.message || "Failed to delete feedback.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertTriangle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-accent fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const getCustomerName = (feedback: any) => {
    if (feedback.customerName) return feedback.customerName;
    if (feedback.user?.firstName) {
      return `${feedback.user.firstName} ${feedback.user.lastName || ''}`.trim();
    }
    return "Anonymous Customer";
  };

  const approveFeedback = (id: string) => {
    updateFeedbackMutation.mutate({ id, status: 'APPROVED' });
  };

  const rejectFeedback = (id: string) => {
    updateFeedbackMutation.mutate({ id, status: 'REJECTED' });
  };

  const toggleFeatured = (id: string, isFeatured: boolean) => {
    updateFeedbackMutation.mutate({ id, isFeatured: !isFeatured });
  };

  const filteredFeedback = statusFilter === "all" 
    ? allFeedback 
    : allFeedback.filter((feedback: any) => feedback.status === statusFilter);

  const approvedFeedback = allFeedback.filter((feedback: any) => feedback.status === 'APPROVED');
  const rejectedFeedback = allFeedback.filter((feedback: any) => feedback.status === 'REJECTED');

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
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="feedback-title">
            Feedback Management
          </h1>
          <p className="text-muted-foreground" data-testid="feedback-description">
            Moderate customer reviews and feedback
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="stat-total-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-feedback-count">
                {allFeedback.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="pending-feedback-count">
                {pendingFeedback.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-approved-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="approved-feedback-count">
                {approvedFeedback.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-rejected-feedback">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="rejected-feedback-count">
                {rejectedFeedback.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full" data-testid="feedback-tabs">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              Approved ({approvedFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              Rejected ({rejectedFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" data-testid="tab-content-pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6" data-testid="pending-feedback-list">
                  {pendingFeedback.length > 0 ? (
                    pendingFeedback.map((feedback: any) => (
                      <div 
                        key={feedback.id} 
                        className="p-6 border rounded-lg bg-yellow-50 border-yellow-200"
                        data-testid={`pending-feedback-${feedback.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-foreground" data-testid={`pending-customer-${feedback.id}`}>
                                {getCustomerName(feedback)}
                              </h3>
                              <div className="flex" data-testid={`pending-rating-${feedback.id}`}>
                                {renderStars(feedback.rating)}
                              </div>
                            </div>
                            {feedback.title && (
                              <p className="font-medium text-primary mb-2" data-testid={`pending-title-${feedback.id}`}>
                                {feedback.title}
                              </p>
                            )}
                            <p className="text-muted-foreground mb-3" data-testid={`pending-comment-${feedback.id}`}>
                              "{feedback.comment}"
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`pending-date-${feedback.id}`}>
                              Submitted on {format(new Date(feedback.createdAt), 'MMM dd, yyyy at h:mm a')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(feedback.status)} data-testid={`pending-status-${feedback.id}`}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(feedback.status)}
                              <span>{feedback.status}</span>
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveFeedback(feedback.id)}
                            disabled={updateFeedbackMutation.isPending}
                            data-testid={`button-approve-${feedback.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => rejectFeedback(feedback.id)}
                            disabled={updateFeedbackMutation.isPending}
                            data-testid={`button-reject-${feedback.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`button-delete-pending-${feedback.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-testid={`delete-pending-dialog-${feedback.id}`}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this feedback? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-testid={`cancel-delete-pending-${feedback.id}`}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFeedbackMutation.mutate(feedback.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`confirm-delete-pending-${feedback.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="no-pending-feedback">
                        No pending feedback to review.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" data-testid="tab-content-approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="approved-feedback-list">
                  {approvedFeedback.length > 0 ? (
                    approvedFeedback.map((feedback: any) => (
                      <div 
                        key={feedback.id} 
                        className="p-4 border rounded-lg bg-green-50 border-green-200"
                        data-testid={`approved-feedback-${feedback.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-foreground" data-testid={`approved-customer-${feedback.id}`}>
                                {getCustomerName(feedback)}
                              </h3>
                              <div className="flex" data-testid={`approved-rating-${feedback.id}`}>
                                {renderStars(feedback.rating)}
                              </div>
                              {feedback.isFeatured && (
                                <Badge variant="secondary" data-testid={`featured-badge-${feedback.id}`}>
                                  Featured
                                </Badge>
                              )}
                            </div>
                            {feedback.title && (
                              <p className="font-medium text-primary mb-2" data-testid={`approved-title-${feedback.id}`}>
                                {feedback.title}
                              </p>
                            )}
                            <p className="text-muted-foreground mb-2" data-testid={`approved-comment-${feedback.id}`}>
                              "{feedback.comment}"
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`approved-date-${feedback.id}`}>
                              {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant={feedback.isFeatured ? "default" : "outline"}
                              onClick={() => toggleFeatured(feedback.id, feedback.isFeatured)}
                              disabled={updateFeedbackMutation.isPending}
                              data-testid={`button-feature-${feedback.id}`}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              {feedback.isFeatured ? "Unfeature" : "Feature"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => rejectFeedback(feedback.id)}
                              disabled={updateFeedbackMutation.isPending}
                              data-testid={`button-unapprove-${feedback.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="no-approved-feedback">
                        No approved feedback yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" data-testid="tab-content-rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="rejected-feedback-list">
                  {rejectedFeedback.length > 0 ? (
                    rejectedFeedback.map((feedback: any) => (
                      <div 
                        key={feedback.id} 
                        className="p-4 border rounded-lg bg-red-50 border-red-200"
                        data-testid={`rejected-feedback-${feedback.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-foreground" data-testid={`rejected-customer-${feedback.id}`}>
                                {getCustomerName(feedback)}
                              </h3>
                              <div className="flex" data-testid={`rejected-rating-${feedback.id}`}>
                                {renderStars(feedback.rating)}
                              </div>
                            </div>
                            {feedback.title && (
                              <p className="font-medium text-primary mb-2" data-testid={`rejected-title-${feedback.id}`}>
                                {feedback.title}
                              </p>
                            )}
                            <p className="text-muted-foreground mb-2" data-testid={`rejected-comment-${feedback.id}`}>
                              "{feedback.comment}"
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`rejected-date-${feedback.id}`}>
                              {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveFeedback(feedback.id)}
                              disabled={updateFeedbackMutation.isPending}
                              data-testid={`button-approve-rejected-${feedback.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" data-testid={`button-delete-rejected-${feedback.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-testid={`delete-rejected-dialog-${feedback.id}`}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this feedback? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid={`cancel-delete-rejected-${feedback.id}`}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteFeedbackMutation.mutate(feedback.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid={`confirm-delete-rejected-${feedback.id}`}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="no-rejected-feedback">
                        No rejected feedback.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Tab */}
          <TabsContent value="all" data-testid="tab-content-all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Feedback</CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="all-feedback-list">
                  {filteredFeedback.length > 0 ? (
                    filteredFeedback.map((feedback: any) => (
                      <div 
                        key={feedback.id} 
                        className="p-4 border rounded-lg"
                        data-testid={`all-feedback-${feedback.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-foreground" data-testid={`all-customer-${feedback.id}`}>
                                {getCustomerName(feedback)}
                              </h3>
                              <div className="flex" data-testid={`all-rating-${feedback.id}`}>
                                {renderStars(feedback.rating)}
                              </div>
                              {feedback.isFeatured && (
                                <Badge variant="secondary" data-testid={`all-featured-${feedback.id}`}>
                                  Featured
                                </Badge>
                              )}
                            </div>
                            {feedback.title && (
                              <p className="font-medium text-primary mb-2" data-testid={`all-title-${feedback.id}`}>
                                {feedback.title}
                              </p>
                            )}
                            <p className="text-muted-foreground mb-2" data-testid={`all-comment-${feedback.id}`}>
                              "{feedback.comment}"
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`all-date-${feedback.id}`}>
                              {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(feedback.status)} data-testid={`all-status-${feedback.id}`}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(feedback.status)}
                                <span>{feedback.status}</span>
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="no-all-feedback">
                        No feedback found matching the current filter.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
