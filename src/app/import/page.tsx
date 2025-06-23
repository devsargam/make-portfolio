import { redirect } from "next/navigation";
import { getServerSession } from "@/utils/get-server-session";
import ImportForm from "./import-form";

export default async function ImportPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const name = session.user.name;
  const avatar = session.user.image ?? "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Import Your Resume</h1>
      <p className="text-muted-foreground mb-8">
        Upload your resume and we'll help you create a beautiful portfolio
      </p>

      <ImportForm name={name} avatar={avatar} />
    </div>
  );
}
