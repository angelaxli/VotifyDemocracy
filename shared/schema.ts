import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const representatives = pgTable("representatives", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  office: text("office").notNull(),
  party: text("party"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  photoUrl: text("photo_url"),
  address: text("address"),
  jurisdiction: text("jurisdiction").notNull(),
  level: text("level").notNull(), // federal, state, local
  socialLinks: json("social_links").$type<Array<{type: string, url: string}>>(),
  stances: json("stances").$type<Record<string, string>>(),
  recentBills: json("recent_bills").$type<Array<{title: string, position: string, description: string}>>(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  office: text("office").notNull(),
  party: text("party"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  photoUrl: text("photo_url"),
  age: integer("age"),
  background: text("background"),
  positions: json("positions").$type<Record<string, string>>(),
  recentActions: json("recent_actions").$type<Array<{title: string, type: string, description: string}>>(),
  raceType: text("race_type").notNull(), // local, national
});

export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(), // local, national
  registrationDeadline: text("registration_deadline"),
  earlyVotingStart: text("early_voting_start"),
  earlyVotingEnd: text("early_voting_end"),
  electionOfficeUrl: text("election_office_url"),
  jurisdiction: text("jurisdiction").notNull(),
});

export const addressSearches = pgTable("address_searches", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  normalizedAddress: text("normalized_address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  jurisdiction: text("jurisdiction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
});

export const insertElectionSchema = createInsertSchema(elections).omit({
  id: true,
});

export const insertAddressSearchSchema = createInsertSchema(addressSearches).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Election = typeof elections.$inferSelect;
export type InsertElection = z.infer<typeof insertElectionSchema>;
export type AddressSearch = typeof addressSearches.$inferSelect;
export type InsertAddressSearch = z.infer<typeof insertAddressSearchSchema>;
