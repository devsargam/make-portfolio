"use server";

import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { revalidateTag } from "next/cache";
import { PortfolioDocument } from "@/db/portfolio-schema";
import { randomUUID } from "crypto";
import { getServerSession } from "@/utils/get-server-session";
import { eq } from "drizzle-orm";

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
