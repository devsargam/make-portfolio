"use server";

import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { revalidateTag } from "next/cache";
import { PortfolioDocument } from "@/db/portfolio-schema";
import { randomUUID } from "crypto";
import { getServerSession } from "@/utils/get-server-session";

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

  // Upsert the portfolio row if it already exists; otherwise insert a new one.
  await db
    .insert(portfolio)
    .values({
      id: randomUUID(),
      userId: "", // Caller should supply correct userId or handle separately
      username,
      content,
      published,
      theme,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: portfolio.username,
      set: { content, published, theme, updatedAt: new Date() },
    });

  // Clear the cached data for all portfolio pages.
  revalidateTag("portfolio");
}
