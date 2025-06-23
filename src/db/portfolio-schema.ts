import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

/*
 * Domain-level types ---------------------------------------------------------
 */

interface SectionBase {
  section:
    | "header"
    | "about"
    | "experience"
    | "education"
    | "skills"
    | "socials"
    | "footer";
  data: unknown;
}

export interface HeaderSection extends SectionBase {
  section: "header";
  data: {
    name: string;
    tagline?: string;
    displayPicture?: string;
  };
}

export interface AboutSection extends SectionBase {
  section: "about";
  data: { markdown: string };
}

export interface ExperienceItem {
  company: string;
  role: string;
  location?: string;
  start: string; // yyyy[-MM]
  end?: string; // yyyy[-MM] | "present"
  highlights?: string[];
}

export interface ExperienceSection extends SectionBase {
  section: "experience";
  data: ExperienceItem[];
}

export interface EducationItem {
  institution: string;
  degree?: string;
  start: string;
  end?: string;
}

export interface EducationSection extends SectionBase {
  section: "education";
  data: EducationItem[];
}

export interface SkillsSection extends SectionBase {
  section: "skills";
  data: string[];
}

export interface SocialLink {
  platform: "github" | "linkedin" | "email" | "website" | (string & {});
  url: string;
}

export interface SocialsSection extends SectionBase {
  section: "socials";
  data: SocialLink[];
}

export interface FooterSection extends SectionBase {
  section: "footer";
  data: { text: string };
}

export type PortfolioSection =
  | HeaderSection
  | AboutSection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | SocialsSection
  | FooterSection;

export type PortfolioDocument = PortfolioSection[];

export type Theme =
  | "default"
  | "pink"
  | "dark"
  | "light"
  | "retro"
  | "modern"
  | "minimal"
  | "gradient"
  | "neon"
  | "matrix"
  | "aurora"
  | "minimal-white";

/*
 * Database schema -----------------------------------------------------------
 */

export const portfolio = pgTable("portfolio", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  username: text("username").notNull().unique(),
  content: jsonb("content").$type<PortfolioDocument>().notNull(),
  published: boolean("published")
    .$defaultFn(() => false)
    .notNull(),
  theme: text("theme").$type<Theme>().notNull().default("default"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});
