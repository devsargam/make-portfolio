"use server";

import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  PortfolioDocument,
  HeaderSection,
  AboutSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  SocialsSection,
  FooterSection,
  Theme,
} from "@/db/portfolio-schema";
import { randomUUID } from "crypto";
import { getServerSession } from "@/utils/get-server-session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

interface UpdatePortfolioParams {
  /** The username whose portfolio should be updated */
  username: string;
  /** The new document to store for this user */
  content: PortfolioDocument;
  /** Whether the portfolio should be publicly visible */
  published?: boolean;
  /** Visual theme to use */
  theme?: "default";
}

/**
 * Persist an updated portfolio for a given user and ensure the cached version
 * of their public page is refreshed.
 */
export async function updatePortfolio({
  username,
  content,
  published = true,
  theme = "default",
}: UpdatePortfolioParams) {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const currentPortfolio = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.username, username))
    .limit(1);

  const currentContent = currentPortfolio[0]?.content ?? [];

  // Some crazy logic to merge the current content with the new content.
  const mergedContentMap = new Map<
    PortfolioDocument[number]["section"],
    PortfolioDocument[number]
  >();

  for (const section of currentContent) {
    mergedContentMap.set(section.section, section);
  }

  for (const section of content) {
    mergedContentMap.set(section.section, section);
  }

  const contentToAdd = Array.from(mergedContentMap.values());

  await db
    .insert(portfolio)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      username,
      content: contentToAdd,
      published,
      theme,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: portfolio.username,
      set: { content: contentToAdd, published, theme, updatedAt: new Date() },
    });

  // Clear the cached data for all portfolio pages.
  revalidateTag("portfolio");
}

/* -------------------------------------------------------------------------- */
/*                               Helper utils                                 */
/* -------------------------------------------------------------------------- */

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function persistSection(
  userId: string,
  username: string,
  newSection:
    | HeaderSection
    | AboutSection
    | ExperienceSection
    | EducationSection
    | SkillsSection
    | SocialsSection
    | FooterSection
) {
  const existing = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.userId, userId))
    .limit(1);

  const currentDoc: PortfolioDocument = existing[0]?.content ?? [];

  const filtered = currentDoc.filter((s) => s.section !== newSection.section);

  const nextDoc: PortfolioDocument = [...filtered, newSection];

  await updatePortfolio({
    username,
    content: nextDoc,
    published: true,
  });

  // Refresh dashboard page so the UI reflects latest data
  revalidatePath("/dashboard");
}

/* -------------------------------------------------------------------------- */
/*                               Server actions                               */
/* -------------------------------------------------------------------------- */

export async function saveHeader(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const name = formData.get("name")?.toString().trim() ?? "";
  const tagline = formData.get("tagline")?.toString().trim() || undefined;
  const displayPicture =
    formData.get("displayPicture")?.toString().trim() || undefined;

  if (!name) {
    throw new Error("Name is required");
  }

  const headerSection: HeaderSection = {
    section: "header",
    data: { name, tagline, displayPicture },
  };

  await persistSection(userId, username, headerSection);
}

export async function saveAbout(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const markdown = formData.get("markdown")?.toString().trim() ?? "";

  const aboutSection: AboutSection = {
    section: "about",
    data: { markdown },
  };

  await persistSection(userId, username, aboutSection);
}

export async function saveSkills(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const skillsRaw = formData.get("skills")?.toString() ?? "";
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const skillsSection: SkillsSection = {
    section: "skills",
    data: skills,
  };

  await persistSection(userId, username, skillsSection);
}

export async function saveSocials(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const platforms = formData.getAll("platform[]") as string[];
  const urls = formData.getAll("url[]") as string[];

  const socialsData = platforms
    .map((platform, idx) => ({
      platform: platform.trim(),
      url: urls[idx]?.toString().trim() ?? "",
    }))
    .filter((s) => s.platform && s.url);

  const socialsSection: SocialsSection = {
    section: "socials",
    data: socialsData,
  };

  await persistSection(userId, username, socialsSection);
}

export async function saveFooter(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const text = formData.get("text")?.toString().trim() ?? "";

  const footerSection: FooterSection = {
    section: "footer",
    data: { text },
  };

  await persistSection(userId, username, footerSection);
}

export async function saveExperience(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const companies = formData.getAll("company[]") as string[];
  const roles = formData.getAll("role[]") as string[];
  const starts = formData.getAll("start[]") as string[];
  const ends = formData.getAll("end[]") as string[];
  const locations = formData.getAll("location[]") as string[];

  const items = companies
    .map((c, idx) => ({
      company: c.trim(),
      role: roles[idx]?.toString().trim() ?? "",
      start: starts[idx]?.toString().trim() ?? "",
      end: ends[idx]?.toString().trim() || undefined,
      location: locations[idx]?.toString().trim() || undefined,
    }))
    .filter((i) => i.company && i.role && i.start);

  const experienceSection: ExperienceSection = {
    section: "experience",
    data: items,
  };

  await persistSection(userId, username, experienceSection);
}

export async function saveEducation(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const institutions = formData.getAll("institution[]") as string[];
  const degrees = formData.getAll("degree[]") as string[];
  const starts = formData.getAll("eduStart[]") as string[];
  const ends = formData.getAll("eduEnd[]") as string[];

  const items = institutions
    .map((inst, idx) => ({
      institution: inst.trim(),
      degree: degrees[idx]?.toString().trim() || undefined,
      start: starts[idx]?.toString().trim() ?? "",
      end: ends[idx]?.toString().trim() || undefined,
    }))
    .filter((i) => i.institution && i.start);

  const educationSection: EducationSection = {
    section: "education",
    data: items,
  };

  await persistSection(userId, username, educationSection);
}

/* -------------------------------------------------------------------------- */
/*                   Bulk save action from structured JSON                    */
/* -------------------------------------------------------------------------- */

export async function savePortfolioFromJson(rawData: unknown) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const username = slugify(session.user.name);

  // Accept loose input and cast guard later.
  const data: any = rawData ?? {};

  const doc: PortfolioDocument = [];

  if (data.header) {
    doc.push({ section: "header", data: data.header } as HeaderSection);
  }

  if (data.about) {
    doc.push({ section: "about", data: data.about } as AboutSection);
  }

  if (data.experience) {
    doc.push({
      section: "experience",
      data: data.experience,
    } as ExperienceSection);
  }

  if (data.education) {
    doc.push({
      section: "education",
      data: data.education,
    } as EducationSection);
  }

  if (data.skills) {
    doc.push({ section: "skills", data: data.skills } as SkillsSection);
  }

  if (data.socials) {
    doc.push({ section: "socials", data: data.socials } as SocialsSection);
  }

  if (data.footer) {
    doc.push({ section: "footer", data: data.footer } as FooterSection);
  }

  if (doc.length === 0) {
    throw new Error("No valid portfolio data found in JSON");
  }

  await updatePortfolio({
    username,
    content: doc,
    published: true,
  });

  // Ensure dashboard reflects latest data
  revalidatePath("/dashboard");
}

export async function importResume({
  username,
  theme,
  resumeText,
  resumeBase64,
  fileType = "text",
  name,
  avatar,
}: {
  username: string;
  theme: Theme;
  resumeText?: string;
  resumeBase64?: string;
  fileType?: "text" | "pdf";
  name?: string;
  avatar?: string;
}) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  try {
    // Check if username is already taken
    const existing = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.username, username))
      .limit(1);

    if (existing.length > 0 && existing[0].userId !== session.user.id) {
      return { success: false, error: "Username is already taken" };
    }

    // Prepare the prompt
    const defaultName = name || "Full Name";
    const defaultAvatar = avatar || null;

    const systemPrompt = `You are a resume parser that converts resumes into portfolio JSON format. Extract information from the resume and return ONLY valid JSON in this exact format:
{
  "header": {
    "name": "${defaultName}",
    "tagline": "Professional tagline",
    "displayPicture": ${defaultAvatar ? `"${defaultAvatar}"` : "null"}
  },
  "about": {
    "markdown": "A professional summary in markdown format"
  },
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "start": "Start Date",
      "end": "End Date or null for current",
      "location": "Location",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "School Name",
      "degree": "Degree Name",
      "start": "Start Date",
      "end": "End Date"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "socials": [
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/in/username"
    }
  ],
  "footer": {
    "text": "© 2024 Name. All rights reserved."
  }
}`;

    const userPrompt =
      "Parse this resume and return ONLY the JSON format specified.";

    // Call the AI chat endpoint to process the resume
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: false,
          pdfBase64: fileType === "pdf" ? resumeBase64 : undefined,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content:
                fileType === "pdf"
                  ? userPrompt
                  : `${userPrompt}\n\n${resumeText}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to process resume");
    }

    const text = await response.text();
    // Extract JSON from the response (it might contain markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const portfolioData = JSON.parse(jsonMatch[0]);

    // Create the portfolio document
    const doc: PortfolioDocument = [];

    if (portfolioData.header) {
      doc.push({
        section: "header",
        data: portfolioData.header,
      } as HeaderSection);
    }

    if (portfolioData.about) {
      doc.push({ section: "about", data: portfolioData.about } as AboutSection);
    }

    if (portfolioData.experience) {
      doc.push({
        section: "experience",
        data: portfolioData.experience,
      } as ExperienceSection);
    }

    if (portfolioData.education) {
      doc.push({
        section: "education",
        data: portfolioData.education,
      } as EducationSection);
    }

    if (portfolioData.skills) {
      doc.push({
        section: "skills",
        data: portfolioData.skills,
      } as SkillsSection);
    }

    if (portfolioData.socials) {
      doc.push({
        section: "socials",
        data: portfolioData.socials,
      } as SocialsSection);
    }

    if (portfolioData.footer) {
      doc.push({
        section: "footer",
        data: portfolioData.footer,
      } as FooterSection);
    }

    // Save the portfolio
    await db
      .insert(portfolio)
      .values({
        id: randomUUID(),
        userId: session.user.id,
        username,
        content: doc,
        published: true,
        theme: theme,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: portfolio.username,
        set: {
          content: doc,
          published: true,
          theme: theme,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard");
    revalidateTag("portfolio");

    return { success: true };
  } catch (error) {
    console.error("Import resume error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import resume",
    };
  }
}
