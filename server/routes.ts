import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertServiceCategorySchema,
  insertServiceSchema,
  insertEventPromoSchema,
  insertBookingSchema,
  insertStaffSchema,
  insertStaffAvailabilitySchema,
  insertStaffServicesSchema,
  insertGalleryImageSchema,
  insertFeedbackSchema,
  insertContactMessageSchema,
  insertContentSettingsSchema,
} from "@shared/schema";
import { calculateEffectivePrice } from "../client/src/lib/pricing";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes - Service Categories
  app.get('/api/service-categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  // Public routes - Services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      const activePromos = await storage.getActiveEventPromos();
      
      // Calculate effective pricing for each service
      const servicesWithPricing = services.map(service => {
        const effectivePrice = calculateEffectivePrice(service, activePromos);
        return {
          ...service,
          effectivePrice: effectivePrice.final,
          originalPrice: effectivePrice.original,
          discount: effectivePrice.discount,
          hasDiscount: effectivePrice.hasDiscount,
        };
      });
      
      res.json(servicesWithPricing);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const activePromos = await storage.getActiveEventPromos();
      const effectivePrice = calculateEffectivePrice(service, activePromos);
      
      res.json({
        ...service,
        effectivePrice: effectivePrice.final,
        originalPrice: effectivePrice.original,
        discount: effectivePrice.discount,
        hasDiscount: effectivePrice.hasDiscount,
      });
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Public routes - Gallery
  app.get('/api/gallery', async (req, res) => {
    try {
      const { category } = req.query;
      const images = category 
        ? await storage.getGalleryImagesByCategory(category as string)
        : await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Public routes - Feedback (approved only)
  app.get('/api/feedback', async (req, res) => {
    try {
      const feedback = await storage.getApprovedFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Public routes - Content Settings
  app.get('/api/content-settings', async (req, res) => {
    try {
      const settings = await storage.getContentSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching content settings:", error);
      res.status(500).json({ message: "Failed to fetch content settings" });
    }
  });

  // Public routes - Active Promotions
  app.get('/api/promotions', async (req, res) => {
    try {
      const promos = await storage.getActiveEventPromos();
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  // Public routes - Staff
  app.get('/api/staff', async (req, res) => {
    try {
      const staff = await storage.getActiveStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Public route - Staff by service
  app.get('/api/staff/by-service/:serviceId', async (req, res) => {
    try {
      const staff = await storage.getStaffByService(req.params.serviceId);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff by service:", error);
      res.status(500).json({ message: "Failed to fetch staff by service" });
    }
  });

  // Public booking creation
  app.post('/api/bookings', async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // TODO: Send confirmation email (placeholder)
      console.log('Booking confirmation email would be sent to:', bookingData.customerEmail);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Public feedback submission
  app.post('/api/feedback', async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Public contact message submission
  app.post('/api/contact', async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  // Protected routes - Customer bookings
  app.get('/api/my-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin-only middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking admin status" });
    }
  };

  // Admin routes - Service Categories
  app.post('/api/admin/service-categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryData = insertServiceCategorySchema.parse(req.body);
      const category = await storage.createServiceCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating service category:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });

  app.put('/api/admin/service-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categoryData = insertServiceCategorySchema.partial().parse(req.body);
      const category = await storage.updateServiceCategory(req.params.id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating service category:", error);
      res.status(500).json({ message: "Failed to update service category" });
    }
  });

  app.delete('/api/admin/service-categories/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteServiceCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service category:", error);
      res.status(500).json({ message: "Failed to delete service category" });
    }
  });

  // Admin routes - Services
  app.post('/api/admin/services', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put('/api/admin/services/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/admin/services/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Admin routes - Event Promos
  app.get('/api/admin/event-promos', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promos = await storage.getEventPromos();
      res.json(promos);
    } catch (error) {
      console.error("Error fetching event promos:", error);
      res.status(500).json({ message: "Failed to fetch event promos" });
    }
  });

  app.post('/api/admin/event-promos', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promoData = insertEventPromoSchema.parse(req.body);
      const promo = await storage.createEventPromo(promoData);
      res.status(201).json(promo);
    } catch (error) {
      console.error("Error creating event promo:", error);
      res.status(500).json({ message: "Failed to create event promo" });
    }
  });

  app.put('/api/admin/event-promos/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promoData = insertEventPromoSchema.partial().parse(req.body);
      const promo = await storage.updateEventPromo(req.params.id, promoData);
      res.json(promo);
    } catch (error) {
      console.error("Error updating event promo:", error);
      res.status(500).json({ message: "Failed to update event promo" });
    }
  });

  app.delete('/api/admin/event-promos/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteEventPromo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event promo:", error);
      res.status(500).json({ message: "Failed to delete event promo" });
    }
  });

  // Admin routes - Bookings
  app.get('/api/admin/bookings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.put('/api/admin/bookings/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Admin routes - Gallery
  app.post('/api/admin/gallery', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const imageData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.put('/api/admin/gallery/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const imageData = insertGalleryImageSchema.partial().parse(req.body);
      const image = await storage.updateGalleryImage(req.params.id, imageData);
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete('/api/admin/gallery/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteGalleryImage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Admin routes - Feedback Management
  app.get('/api/admin/feedback', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get('/api/admin/feedback/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const feedback = await storage.getPendingFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching pending feedback:", error);
      res.status(500).json({ message: "Failed to fetch pending feedback" });
    }
  });

  app.put('/api/admin/feedback/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.partial().parse(req.body);
      const feedback = await storage.updateFeedback(req.params.id, feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  app.delete('/api/admin/feedback/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteFeedback(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ message: "Failed to delete feedback" });
    }
  });

  // Admin routes - Contact Messages
  app.get('/api/admin/contact-messages', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put('/api/admin/contact-messages/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.partial().parse(req.body);
      const message = await storage.updateContactMessage(req.params.id, messageData);
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  // Admin routes - Content Settings
  app.put('/api/admin/content-settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settingsData = insertContentSettingsSchema.parse(req.body);
      const settings = await storage.updateContentSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating content settings:", error);
      res.status(500).json({ message: "Failed to update content settings" });
    }
  });

  // Admin routes - Staff Management
  app.get('/api/admin/staff', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get('/api/admin/staff/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(req.params.id);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      console.error("Error fetching staff member:", error);
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post('/api/admin/staff', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  app.put('/api/admin/staff/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const staffData = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(req.params.id, staffData);
      res.json(staff);
    } catch (error) {
      console.error("Error updating staff:", error);
      res.status(500).json({ message: "Failed to update staff" });
    }
  });

  app.delete('/api/admin/staff/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteStaff(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff:", error);
      res.status(500).json({ message: "Failed to delete staff" });
    }
  });

  // Admin routes - Staff Availability
  app.get('/api/admin/staff/:staffId/availability', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const availability = await storage.getStaffAvailability(req.params.staffId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      res.status(500).json({ message: "Failed to fetch staff availability" });
    }
  });

  app.post('/api/admin/staff/availability', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const availabilityData = insertStaffAvailabilitySchema.parse(req.body);
      const availability = await storage.createStaffAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating staff availability:", error);
      res.status(500).json({ message: "Failed to create staff availability" });
    }
  });

  app.put('/api/admin/staff/availability/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const availabilityData = insertStaffAvailabilitySchema.partial().parse(req.body);
      const availability = await storage.updateStaffAvailability(req.params.id, availabilityData);
      res.json(availability);
    } catch (error) {
      console.error("Error updating staff availability:", error);
      res.status(500).json({ message: "Failed to update staff availability" });
    }
  });

  app.delete('/api/admin/staff/availability/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteStaffAvailability(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff availability:", error);
      res.status(500).json({ message: "Failed to delete staff availability" });
    }
  });

  // Admin routes - Staff Services
  app.get('/api/admin/staff/:staffId/services', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const services = await storage.getStaffServices(req.params.staffId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching staff services:", error);
      res.status(500).json({ message: "Failed to fetch staff services" });
    }
  });

  app.post('/api/admin/staff/:staffId/services/:serviceId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const staffService = await storage.assignServiceToStaff(req.params.staffId, req.params.serviceId);
      res.status(201).json(staffService);
    } catch (error) {
      console.error("Error assigning service to staff:", error);
      res.status(500).json({ message: "Failed to assign service to staff" });
    }
  });

  app.delete('/api/admin/staff/:staffId/services/:serviceId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.removeServiceFromStaff(req.params.staffId, req.params.serviceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing service from staff:", error);
      res.status(500).json({ message: "Failed to remove service from staff" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
