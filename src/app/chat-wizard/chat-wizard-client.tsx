"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { savePortfolioFromJson } from "../actions";

function systemPrompt(name?: string, avatar?: string): string {
  const defaultName = name || "Your Name";
  const defaultAvatar = avatar || null;
  return `You are an onboarding assistant that gathers information from users to generate their portfolio JSON. 
  Ask questions one by one in a friendly tone to collect the following sections:
  1. Header – name (default: ${defaultName}), optional tagline, optional displayPicture URL (default: ${defaultAvatar ? `"${defaultAvatar}"` : "null"}).
  2. About – markdown text describing the user.
  3. Experience – up to 3 items, each with company, role, location (optional), start (YYYY or YYYY-MM), end (optional).
  4. Education – up to 3 items with institution, degree (optional), start (YYYY), end (optional).
  5. Skills – a comma-separated list.
  6. Socials – up to 5 items with platform and url.
  7. Footer – text shown in footer.

  If the user doesn't provide a name, use "${defaultName}". If they don't provide a display picture, use ${defaultAvatar ? `"${defaultAvatar}"` : "null"}.

  After you have gathered all answers, respond **once** with ONLY a JSON object matching this TypeScript interface:
  interface PortfolioData {
    header: { name: string; tagline?: string; displayPicture?: string };
    about: { markdown: string };
    experience: { company: string; role: string; location?: string; start: string; end?: string }[];
    education: { institution: string; degree?: string; start: string; end?: string }[];
    skills: string[];
    socials: { platform: string; url: string }[];
    footer: { text: string };
  }

  Wrap the JSON inside a fenced code block labelled as JSON so that it can be extracted easily.`;
}

interface ChatWizardProps {
  name?: string;
  avatar?: string;
}

export default function ChatWizardClient({ name, avatar }: ChatWizardProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "system",
        role: "system",
        content: systemPrompt(name, avatar),
      },
      {
        id: "user",
        role: "assistant",
        content: "Hello, I'm here to help you create your portfolio.",
      },
    ],
    onFinish: async (message) => {
      if (message.role !== "assistant") return;
      const match = message.content.match(/```json[\s\S]*?```/);
      if (!match) return;

      const jsonSnippet = match[0]
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();

      try {
        const data = JSON.parse(jsonSnippet);
        await savePortfolioFromJson(data);
        append({
          role: "assistant",
          content:
            "🎉 All set! Your portfolio has been saved. You can head over to the dashboard to preview it.",
        });
      } catch (err) {
        console.error("Failed to parse/save portfolio JSON", err);
      }
    },
  });

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col gap-4 p-4">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-md border p-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((m, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm md:text-base ${
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted"
              }`}
            >
              {m.content}
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}