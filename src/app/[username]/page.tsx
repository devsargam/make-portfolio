import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { eq } from "drizzle-orm";
import { DefaultPortfolioTheme } from "@/components/portfolio-themes/default";
import { Metadata } from "next";
import { unstable_cache as cache } from "next/cache";

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
    default:
      return <div>No theme found</div>;
  }
}
