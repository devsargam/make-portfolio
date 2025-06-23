import { redirect } from "next/navigation";
import { getServerSession } from "@/utils/get-server-session";
import ChatWizardClient from "./chat-wizard-client";

export default async function ChatWizardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const name = session.user.name;
  const avatar = session.user.image;

  return <ChatWizardClient name={name} avatar={avatar} />;
}
