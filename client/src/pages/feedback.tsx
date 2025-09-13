import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { insertFeedbackSchema } from "@shared/schema";
import { Star, Send } from "lucide-react";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    customerName: ""
  });

  useEffect(() => {
    document.title = "Leave Feedback - Serenity Beauty Salon";
    
    // Pre-fill customer name if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }));
    }
  }, [user]);

  const { data: approvedFeedback = [] } = useQuery({
    queryKey: ["/api/feedback"],
  });

  const { data: contentSettings } = useQuery({
    queryKey: ["/api/content-settings"],
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      return apiRequest("POST", "/api/feedback", feedbackData);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. It will be reviewed before appearing on our site.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      
      // Reset form
      setRating(0);
      setFormData({
        title: "",
        comment: "",
        customerName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ""
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 || !formData.comment.trim() || !formData.customerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating, comment, and your name.",
        variant: "destructive",
      });
      return;
    }

    const feedbackData = {
      userId: user?.id || null,
      rating,
      title: formData.title.trim() || null,
      comment: formData.comment.trim(),
      customerName: formData.customerName.trim(),
      imageUrls: [], // TODO: Add image upload functionality
    };

    createFeedbackMutation.mutate(feedbackData);
  };

  const renderStars = (count: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < (interactive ? (hoverRating || rating) : count)
            ? 'text-accent fill-current' 
            : 'text-muted-foreground'
        }`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        data-testid={interactive ? `star-input-${i + 1}` : `star-display-${i + 1}`}
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4" data-testid="feedback-title">
              Share Your Experience
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="feedback-description">
              We value your feedback and use it to improve our services
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Feedback Form */}
            <div>
              <Card className="shadow-lg" data-testid="feedback-form-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" data-testid="form-title">
                    Leave Your Feedback
                  </CardTitle>
                  <p className="text-muted-foreground" data-testid="form-description">
                    Help us serve you better by sharing your experience
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="feedback-form">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        Your Rating *
                      </Label>
                      <div className="flex space-x-1" data-testid="rating-input">
                        {renderStars(5, true)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="rating-text">
                        {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="customerName" className="text-sm font-semibold text-foreground mb-2 block">
                        Your Name *
                      </Label>
                      <Input
                        id="customerName"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        data-testid="input-customer-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="title" className="text-sm font-semibold text-foreground mb-2 block">
                        Title (Optional)
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Brief title for your review"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        data-testid="input-title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="comment" className="text-sm font-semibold text-foreground mb-2 block">
                        Your Review *
                      </Label>
                      <Textarea
                        id="comment"
                        rows={4}
                        placeholder="Tell us about your experience..."
                        value={formData.comment}
                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        data-testid="textarea-comment"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={createFeedbackMutation.isPending}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-submit-feedback"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {createFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Existing Feedback */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6" data-testid="reviews-title">
                What Our Clients Say
              </h2>
              
              <div className="space-y-6 max-h-[600px] overflow-y-auto" data-testid="reviews-list">
                {approvedFeedback.length > 0 ? (
                  approvedFeedback.map((feedback: any) => (
                    <Card key={feedback.id} className="shadow-sm" data-testid={`review-${feedback.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground" data-testid={`review-name-${feedback.id}`}>
                              {getCustomerName(feedback)}
                            </h4>
                            {feedback.title && (
                              <p className="text-sm font-medium text-primary" data-testid={`review-title-${feedback.id}`}>
                                {feedback.title}
                              </p>
                            )}
                          </div>
                          {feedback.isFeatured && (
                            <Badge variant="secondary" data-testid={`featured-badge-${feedback.id}`}>
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex mb-3" data-testid={`review-rating-${feedback.id}`}>
                          {renderStars(feedback.rating)}
                        </div>
                        
                        <p className="text-muted-foreground" data-testid={`review-comment-${feedback.id}`}>
                          "{feedback.comment}"
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-3" data-testid={`review-date-${feedback.id}`}>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground" data-testid="text-no-reviews">
                        No reviews yet. Be the first to share your experience!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer contentSettings={contentSettings} />
    </div>
  );
}
