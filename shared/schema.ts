import { sql } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'CUSTOMER']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'DONE']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const discountTypeEnum = pgEnum('discount_type', ['PERCENT', 'AMOUNT']);
export const scopeTypeEnum = pgEnum('scope_type', ['GLOBAL', 'CATEGORY', 'SERVICE']);
export const galleryCategoryEnum = pgEnum('gallery_category', ['Nail', 'Eyelash', 'Facial', 'General']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

// User storage table.
// Updated to support custom email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone").notNull(),
  role: userRoleEnum("role").default('CUSTOMER').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // Nail, Eyelash, Facial
  slug: varchar("slug").notNull().unique(),
  order: integer("order").default(0),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => serviceCategories.id).notNull(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  durationMins: integer("duration_mins").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventPromos = pgTable("event_promos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  scopeType: scopeTypeEnum("scope_type").notNull(),
  scopeId: varchar("scope_id"), // nullable, references category or service id
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  position: varchar("position"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  skills: text("skills").array(),
  experienceYears: integer("experience_years"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // nullable for guest bookings
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id),
  dateTime: timestamp("date_time").notNull(),
  durationMins: integer("duration_mins").notNull(),
  status: bookingStatusEnum("status").default('PENDING').notNull(),
  notes: text("notes"),
  customerName: varchar("customer_name"),
  customerPhone: varchar("customer_phone"),
  customerEmail: varchar("customer_email"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: varchar("url").notNull(),
  category: galleryCategoryEnum("category").notNull(),
  caption: varchar("caption"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // nullable for anonymous feedback
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  comment: text("comment"),
  imageUrls: text("image_urls").array(),
  status: feedbackStatusEnum("status").default('PENDING').notNull(),
  isFeatured: boolean("is_featured").default(false),
  customerName: varchar("customer_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  message: text("message").notNull(),
  handled: boolean("handled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staffAvailability = pgTable("staff_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: varchar("start_time").notNull(), // Format: "09:00"
  endTime: varchar("end_time").notNull(), // Format: "17:00"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staffServices = pgTable("staff_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentSettings = pgTable("content_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slogans: text("slogans").array(),
  address: text("address"),
  facebookUrl: varchar("facebook_url"),
  zaloUrl: varchar("zalo_url"),
  instagramUrl: varchar("instagram_url"),
  phone: varchar("phone"),
  openingHours: jsonb("opening_hours"),
  heroImages: text("hero_images").array(),
  seo: jsonb("seo"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  bookings: many(bookings),
  staffServices: many(staffServices),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  feedback: many(feedback),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [bookings.staffId],
    references: [staff.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  bookings: many(bookings),
  availability: many(staffAvailability),
  staffServices: many(staffServices),
}));

export const staffAvailabilityRelations = relations(staffAvailability, ({ one }) => ({
  staff: one(staff, {
    fields: [staffAvailability.staffId],
    references: [staff.id],
  }),
}));

export const staffServicesRelations = relations(staffServices, ({ one }) => ({
  staff: one(staff, {
    fields: [staffServices.staffId],
    references: [staff.id],
  }),
  service: one(services, {
    fields: [staffServices.serviceId],
    references: [services.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertEventPromoSchema = createInsertSchema(eventPromos).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  dateTime: z.string().or(z.date()).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertContentSettingsSchema = createInsertSchema(contentSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertStaffAvailabilitySchema = createInsertSchema(staffAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertStaffServicesSchema = createInsertSchema(staffServices).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type EventPromo = typeof eventPromos.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ContentSettings = typeof contentSettings.$inferSelect;
export type StaffAvailability = typeof staffAvailability.$inferSelect;
export type StaffServices = typeof staffServices.$inferSelect;

export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertEventPromo = z.infer<typeof insertEventPromoSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertContentSettings = z.infer<typeof insertContentSettingsSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertStaffAvailability = z.infer<typeof insertStaffAvailabilitySchema>;
export type InsertStaffServices = z.infer<typeof insertStaffServicesSchema>;
