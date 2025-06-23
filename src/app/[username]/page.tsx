import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { eq } from "drizzle-orm";
import { DefaultPortfolioTheme } from "@/components/portfolio-themes/default";
import { Metadata } from "next";
import { unstable_cache as cache } from "next/cache";
import { PinkPortfolioTheme } from "@/components/portfolio-themes/pink";
import { MidnightPortfolioTheme } from "@/components/portfolio-themes/midnight";
import { LightPortfolioTheme } from "@/components/portfolio-themes/light";
import { RetroPortfolioTheme } from "@/components/portfolio-themes/retro";
import { ModernPortfolioTheme } from "@/components/portfolio-themes/modern";
import { MinimalPortfolioTheme } from "@/components/portfolio-themes/minimal";
import { GradientPortfolioTheme } from "@/components/portfolio-themes/gradient";
import { NeonPortfolioTheme } from "@/components/portfolio-themes/neon";
import { MatrixPortfolioTheme } from "@/components/portfolio-themes/matrix";
import { AuroraPortfolioTheme } from "@/components/portfolio-themes/aurora";
import { MinimalWhitePortfolioTheme } from "@/components/portfolio-themes/minimal-white";

interface UserPageParams {
  username: string;
}

export async function generateStaticParams() {
  const data = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.published, true));

  return data.map((portfolio) => ({
    username: portfolio.username,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<UserPageParams>;
}): Promise<Metadata> {
  const { username } = await params;

  const makeTitle = (username: string) => {
    return `${username}'s Portfolio`;
  };

  return {
    title: makeTitle(username),
  };
}

export const revalidate = 3600;

const getPortfolio = cache(
  async (username: string) => {
    return await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.username, username))
      .limit(1);
  },
  ["portfolio-by-username"],
  { tags: ["portfolio"] }
);

export default async function UserPage({
  params,
}: {
  params: Promise<UserPageParams>;
}) {
  const { username } = await params;

  const data = await getPortfolio(username);

  switch (data[0]?.theme) {
    case "default":
      return <DefaultPortfolioTheme content={data[0]?.content} />;
    case "pink":
      return <PinkPortfolioTheme content={data[0]?.content} />;
    case "midnight":
      return <MidnightPortfolioTheme content={data[0]?.content} />;
    case "light":
      return <LightPortfolioTheme content={data[0]?.content} />;
    case "retro":
      return <RetroPortfolioTheme content={data[0]?.content} />;
    case "modern":
      return <ModernPortfolioTheme content={data[0]?.content} />;
    case "minimal":
      return <MinimalPortfolioTheme content={data[0]?.content} />;
    case "gradient":
      return <GradientPortfolioTheme content={data[0]?.content} />;
    case "neon":
      return <NeonPortfolioTheme content={data[0]?.content} />;
    case "matrix":
      return <MatrixPortfolioTheme content={data[0]?.content} />;
    case "aurora":
      return <AuroraPortfolioTheme content={data[0]?.content} />;
    case "minimal-white":
      return <MinimalWhitePortfolioTheme content={data[0]?.content} />;
    default:
      return <div>No theme found</div>;
  }
}
