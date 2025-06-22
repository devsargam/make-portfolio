import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { eq } from "drizzle-orm";
import { DefaultPortfolioTheme } from "@/components/portfolio-themes/default";
import { Metadata } from "next";

interface UserPageParams {
  username: string;
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

export default async function UserPage({
  params,
}: {
  params: Promise<UserPageParams>;
}) {
  const { username } = await params;

  const data = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.username, username))
    .limit(1);

  switch (data[0]?.theme) {
    case "default":
      return <DefaultPortfolioTheme content={data[0]?.content} />;
    default:
      return <div>No theme found</div>;
  }
}
