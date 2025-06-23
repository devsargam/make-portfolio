"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { importResume } from "@/app/actions";
import { Loader2 } from "lucide-react";

const themes = [
  { value: "default", label: "Default" },
  { value: "pink", label: "Pink" },
  { value: "midnight", label: "Midnight" },
];

export default function ImportForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("default");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResumeFile(file);

    if (file.type === "text/plain" || file.type === "text/markdown") {
      const text = await file.text();
      setResumeText(text);
    } else if (file.type === "application/pdf") {
      // For PDFs, we'll send the file directly
      setResumeText("PDF file selected - will be parsed on import");
    } else {
      setError("Please upload a text, markdown, or PDF file.");
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;
      
      if (resumeFile && resumeFile.type === "application/pdf") {
        // For PDFs, convert to base64 and send
        const arrayBuffer = await resumeFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        result = await importResume({
          username,
          theme,
          resumeText: "",
          resumeBase64: base64,
          fileType: "pdf",
        });
      } else {
        // For text files
        result = await importResume({
          username,
          theme,
          resumeText,
          fileType: "text",
        });
      }

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to import resume");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          required
          pattern="[a-z0-9\-]+"
          title="Username can only contain lowercase letters, numbers, and hyphens"
        />
        <p className="text-sm text-muted-foreground">
          This will be your portfolio URL: /{username}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume</Label>
        <Input
          id="resume"
          type="file"
          onChange={handleFileUpload}
          accept=".txt,.md,.pdf"
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          Upload a text, markdown, or PDF file
        </p>
      </div>

      {resumeText && resumeFile?.type !== "application/pdf" && (
        <div className="space-y-2">
          <Label htmlFor="resume-text">Resume Content</Label>
          <Textarea
            id="resume-text"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            You can edit the content before importing
          </p>
        </div>
      )}

      {resumeFile?.type === "application/pdf" && (
        <div className="rounded-md bg-muted p-3 text-sm">
          PDF file selected: {resumeFile.name}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !username || (!resumeText && !resumeFile)}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating your portfolio...
          </>
        ) : (
          "Import Resume"
        )}
      </Button>
    </form>
  );
}