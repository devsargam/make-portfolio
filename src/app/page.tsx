import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Not logged in</div>;
  }

  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}
