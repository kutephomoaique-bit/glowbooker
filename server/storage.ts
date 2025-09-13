import {
  users,
  serviceCategories,
  services,
  eventPromos,
  bookings,
  staff,
  galleryImages,
  feedback,
  contactMessages,
  contentSettings,
  type User,
  type UpsertUser,
  type ServiceCategory,
  type Service,
  type EventPromo,
  type Booking,
  type Staff,
  type GalleryImage,
  type Feedback,
  type ContactMessage,
  type ContentSettings,
  type InsertServiceCategory,
  type InsertService,
  type InsertEventPromo,
  type InsertBooking,
  type InsertGalleryImage,
  type InsertFeedback,
  type InsertContactMessage,
  type InsertContentSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser, id?: string): Promise<User>;
  
  // Service Category operations
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: string, category: Partial<InsertServiceCategory>): Promise<ServiceCategory>;
  deleteServiceCategory(id: string): Promise<void>;
  
  // Service operations
  getServices(): Promise<(Service & { category: ServiceCategory })[]>;
  getServicesByCategory(categoryId: string): Promise<Service[]>;
  getService(id: string): Promise<(Service & { category: ServiceCategory }) | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  
  // Event/Promo operations
  getActiveEventPromos(): Promise<EventPromo[]>;
  getEventPromos(): Promise<EventPromo[]>;
  createEventPromo(promo: InsertEventPromo): Promise<EventPromo>;
  updateEventPromo(id: string, promo: Partial<InsertEventPromo>): Promise<EventPromo>;
  deleteEventPromo(id: string): Promise<void>;
  
  // Booking operations
  getBookings(): Promise<(Booking & { service: Service & { category: ServiceCategory }, user?: User, staff?: Staff })[]>;
  getBookingsByUser(userId: string): Promise<(Booking & { service: Service & { category: ServiceCategory }, staff?: Staff })[]>;
  getBooking(id: string): Promise<(Booking & { service: Service & { category: ServiceCategory }, user?: User, staff?: Staff }) | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  
  // Staff operations
  getStaff(): Promise<Staff[]>;
  getActiveStaff(): Promise<Staff[]>;
  createStaff(staff: { name: string; bio?: string; skills?: string[]; isActive?: boolean }): Promise<Staff>;
  updateStaff(id: string, staff: Partial<{ name: string; bio?: string; skills?: string[]; isActive?: boolean }>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
  
  // Feedback operations
  getFeedback(): Promise<(Feedback & { user?: User })[]>;
  getApprovedFeedback(): Promise<(Feedback & { user?: User })[]>;
  getPendingFeedback(): Promise<(Feedback & { user?: User })[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, feedback: Partial<InsertFeedback>): Promise<Feedback>;
  deleteFeedback(id: string): Promise<void>;
  
  // Contact operations
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: string, message: Partial<InsertContactMessage>): Promise<ContactMessage>;
  deleteContactMessage(id: string): Promise<void>;
  
  // Content Settings operations
  getContentSettings(): Promise<ContentSettings | undefined>;
  updateContentSettings(settings: InsertContentSettings): Promise<ContentSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser, id?: string): Promise<User> {
    const userWithId = id ? { ...userData, id } : userData;
    const [user] = await db
      .insert(users)
      .values(userWithId)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Service Category operations
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(serviceCategories.order);
  }
  
  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [created] = await db.insert(serviceCategories).values(category).returning();
    return created;
  }
  
  async updateServiceCategory(id: string, category: Partial<InsertServiceCategory>): Promise<ServiceCategory> {
    const [updated] = await db
      .update(serviceCategories)
      .set(category)
      .where(eq(serviceCategories.id, id))
      .returning();
    return updated;
  }
  
  async deleteServiceCategory(id: string): Promise<void> {
    await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
  }
  
  // Service operations
  async getServices(): Promise<(Service & { category: ServiceCategory })[]> {
    return await db
      .select()
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .then(rows => rows.map(row => ({ ...row.services, category: row.service_categories! })));
  }
  
  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.categoryId, categoryId));
  }
  
  async getService(id: string): Promise<(Service & { category: ServiceCategory }) | undefined> {
    const [result] = await db
      .select()
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.id, id));
    
    if (!result) return undefined;
    return { ...result.services, category: result.service_categories! };
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }
  
  async updateService(id: string, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }
  
  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }
  
  // Event/Promo operations
  async getActiveEventPromos(): Promise<EventPromo[]> {
    const now = new Date();
    return await db
      .select()
      .from(eventPromos)
      .where(
        and(
          eq(eventPromos.isActive, true),
          lte(eventPromos.startAt, now),
          gte(eventPromos.endAt, now)
        )
      );
  }
  
  async getEventPromos(): Promise<EventPromo[]> {
    return await db.select().from(eventPromos).orderBy(desc(eventPromos.createdAt));
  }
  
  async createEventPromo(promo: InsertEventPromo): Promise<EventPromo> {
    const [created] = await db.insert(eventPromos).values(promo).returning();
    return created;
  }
  
  async updateEventPromo(id: string, promo: Partial<InsertEventPromo>): Promise<EventPromo> {
    const [updated] = await db
      .update(eventPromos)
      .set(promo)
      .where(eq(eventPromos.id, id))
      .returning();
    return updated;
  }
  
  async deleteEventPromo(id: string): Promise<void> {
    await db.delete(eventPromos).where(eq(eventPromos.id, id));
  }
  
  // Booking operations
  async getBookings(): Promise<(Booking & { service: Service & { category: ServiceCategory }, user?: User, staff?: Staff })[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(staff, eq(bookings.staffId, staff.id))
      .orderBy(desc(bookings.dateTime));
    
    return results.map(row => ({
      ...row.bookings,
      service: { ...row.services!, category: row.service_categories! },
      user: row.users || undefined,
      staff: row.staff || undefined,
    }));
  }
  
  async getBookingsByUser(userId: string): Promise<(Booking & { service: Service & { category: ServiceCategory }, staff?: Staff })[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .leftJoin(staff, eq(bookings.staffId, staff.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.dateTime));
    
    return results.map(row => ({
      ...row.bookings,
      service: { ...row.services!, category: row.service_categories! },
      staff: row.staff || undefined,
    }));
  }
  
  async getBooking(id: string): Promise<(Booking & { service: Service & { category: ServiceCategory }, user?: User, staff?: Staff }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(staff, eq(bookings.staffId, staff.id))
      .where(eq(bookings.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.bookings,
      service: { ...result.services!, category: result.service_categories! },
      user: result.users || undefined,
      staff: result.staff || undefined,
    };
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }
  
  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }
  
  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }
  
  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(staff.name);
  }
  
  async getActiveStaff(): Promise<Staff[]> {
    return await db.select().from(staff).where(eq(staff.isActive, true)).orderBy(staff.name);
  }
  
  async createStaff(staffData: { name: string; bio?: string; skills?: string[]; isActive?: boolean }): Promise<Staff> {
    const [created] = await db.insert(staff).values(staffData).returning();
    return created;
  }
  
  async updateStaff(id: string, staffData: Partial<{ name: string; bio?: string; skills?: string[]; isActive?: boolean }>): Promise<Staff> {
    const [updated] = await db
      .update(staff)
      .set(staffData)
      .where(eq(staff.id, id))
      .returning();
    return updated;
  }
  
  async deleteStaff(id: string): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }
  
  // Gallery operations
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(galleryImages.order, galleryImages.createdAt);
  }
  
  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.category, category as any))
      .orderBy(galleryImages.order, galleryImages.createdAt);
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [created] = await db.insert(galleryImages).values(image).returning();
    return created;
  }
  
  async updateGalleryImage(id: string, image: Partial<InsertGalleryImage>): Promise<GalleryImage> {
    const [updated] = await db
      .update(galleryImages)
      .set(image)
      .where(eq(galleryImages.id, id))
      .returning();
    return updated;
  }
  
  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }
  
  // Feedback operations
  async getFeedback(): Promise<(Feedback & { user?: User })[]> {
    const results = await db
      .select()
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(desc(feedback.createdAt));
    
    return results.map(row => ({
      ...row.feedback,
      user: row.users || undefined,
    }));
  }
  
  async getApprovedFeedback(): Promise<(Feedback & { user?: User })[]> {
    const results = await db
      .select()
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .where(eq(feedback.status, 'APPROVED'))
      .orderBy(desc(feedback.createdAt));
    
    return results.map(row => ({
      ...row.feedback,
      user: row.users || undefined,
    }));
  }
  
  async getPendingFeedback(): Promise<(Feedback & { user?: User })[]> {
    const results = await db
      .select()
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .where(eq(feedback.status, 'PENDING'))
      .orderBy(desc(feedback.createdAt));
    
    return results.map(row => ({
      ...row.feedback,
      user: row.users || undefined,
    }));
  }
  
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [created] = await db.insert(feedback).values(feedbackData).returning();
    return created;
  }
  
  async updateFeedback(id: string, feedbackData: Partial<InsertFeedback>): Promise<Feedback> {
    const [updated] = await db
      .update(feedback)
      .set(feedbackData)
      .where(eq(feedback.id, id))
      .returning();
    return updated;
  }
  
  async deleteFeedback(id: string): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id));
  }
  
  // Contact operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }
  
  async updateContactMessage(id: string, message: Partial<InsertContactMessage>): Promise<ContactMessage> {
    const [updated] = await db
      .update(contactMessages)
      .set(message)
      .where(eq(contactMessages.id, id))
      .returning();
    return updated;
  }
  
  async deleteContactMessage(id: string): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
  
  // Content Settings operations
  async getContentSettings(): Promise<ContentSettings | undefined> {
    const [settings] = await db.select().from(contentSettings).limit(1);
    return settings;
  }
  
  async updateContentSettings(settings: InsertContentSettings): Promise<ContentSettings> {
    // First try to update existing record
    const existing = await this.getContentSettings();
    
    if (existing) {
      const [updated] = await db
        .update(contentSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(contentSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record if none exists
      const [created] = await db.insert(contentSettings).values(settings).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
