import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
import { DefaultPortfolioTheme } from "@/components/portfolio-themes/default";
import { getServerSession } from "@/utils/get-server-session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  PortfolioDocument,
  HeaderSection,
  AboutSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  SocialsSection,
  FooterSection,
} from "@/db/portfolio-schema";
import { updatePortfolio } from "../actions";
import { revalidatePath } from "next/cache";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* -------------------------------------------------------------------------- */
/*                               Server actions                               */
/* -------------------------------------------------------------------------- */

export async function saveHeader(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const name = formData.get("name")?.toString().trim() ?? "";
  const tagline = formData.get("tagline")?.toString().trim() || undefined;
  const displayPicture =
    formData.get("displayPicture")?.toString().trim() || undefined;

  if (!name) {
    throw new Error("Name is required");
  }

  const headerSection: HeaderSection = {
    section: "header",
    data: { name, tagline, displayPicture },
  };

  await persistSection(userId, username, headerSection);
}

export async function saveAbout(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const markdown = formData.get("markdown")?.toString().trim() ?? "";

  const aboutSection: AboutSection = {
    section: "about",
    data: { markdown },
  };

  await persistSection(userId, username, aboutSection);
}

export async function saveSkills(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const skillsRaw = formData.get("skills")?.toString() ?? "";
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const skillsSection: SkillsSection = {
    section: "skills",
    data: skills,
  };

  await persistSection(userId, username, skillsSection);
}

export async function saveSocials(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const platforms = formData.getAll("platform[]") as string[];
  const urls = formData.getAll("url[]") as string[];

  const socialsData = platforms
    .map((platform, idx) => ({
      platform: platform.trim(),
      url: urls[idx]?.toString().trim() ?? "",
    }))
    .filter((s) => s.platform && s.url);

  const socialsSection: SocialsSection = {
    section: "socials",
    data: socialsData,
  };

  await persistSection(userId, username, socialsSection);
}

export async function saveFooter(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const text = formData.get("text")?.toString().trim() ?? "";

  const footerSection: FooterSection = {
    section: "footer",
    data: { text },
  };

  await persistSection(userId, username, footerSection);
}

/*
 * Experience and Education – allow up to 3 items via indexed fields
 */
export async function saveExperience(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const companies = formData.getAll("company[]") as string[];
  const roles = formData.getAll("role[]") as string[];
  const starts = formData.getAll("start[]") as string[];
  const ends = formData.getAll("end[]") as string[];
  const locations = formData.getAll("location[]") as string[];

  const items = companies
    .map((c, idx) => ({
      company: c.trim(),
      role: roles[idx]?.toString().trim() ?? "",
      start: starts[idx]?.toString().trim() ?? "",
      end: ends[idx]?.toString().trim() || undefined,
      location: locations[idx]?.toString().trim() || undefined,
    }))
    .filter((i) => i.company && i.role && i.start);

  const experienceSection: ExperienceSection = {
    section: "experience",
    data: items,
  };

  await persistSection(userId, username, experienceSection);
}

export async function saveEducation(formData: FormData) {
  "use server";
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const username = slugify(session.user.name);

  const institutions = formData.getAll("institution[]") as string[];
  const degrees = formData.getAll("degree[]") as string[];
  const starts = formData.getAll("eduStart[]") as string[];
  const ends = formData.getAll("eduEnd[]") as string[];

  const items = institutions
    .map((inst, idx) => ({
      institution: inst.trim(),
      degree: degrees[idx]?.toString().trim() || undefined,
      start: starts[idx]?.toString().trim() ?? "",
      end: ends[idx]?.toString().trim() || undefined,
    }))
    .filter((i) => i.institution && i.start);

  const educationSection: EducationSection = {
    section: "education",
    data: items,
  };

  await persistSection(userId, username, educationSection);
}

/* ------------------------------ persistence ------------------------------- */

async function persistSection(
  userId: string,
  username: string,
  newSection:
    | HeaderSection
    | AboutSection
    | ExperienceSection
    | EducationSection
    | SkillsSection
    | SocialsSection
    | FooterSection
) {
  // Fetch existing
  const existing = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.userId, userId))
    .limit(1);

  const currentDoc: PortfolioDocument = existing[0]?.content ?? [];

  // Remove any previous version of the same section
  const filtered = currentDoc.filter((s) => s.section !== newSection.section);

  const nextDoc: PortfolioDocument = [...filtered, newSection];

  await updatePortfolio({
    username,
    content: nextDoc,
    published: true,
  });

  // refresh this page to reflect latest data
  revalidatePath("/dashboard");
}

/* -------------------------------------------------------------------------- */
/*                                  UI Page                                   */
/* -------------------------------------------------------------------------- */

export default async function Dashboard() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  const existing = await db
    .select()
    .from(portfolio)
    .where(eq(portfolio.userId, userId))
    .limit(1);

  const doc: PortfolioDocument = existing[0]?.content ?? [];

  const getData = <T extends PortfolioDocument[number]["section"]>(
    section: T
  ) =>
    (
      doc.find((s) => s.section === section) as Extract<
        PortfolioDocument[number],
        { section: T }
      > | null
    )?.data;

  const header = getData("header") as HeaderSection["data"] | undefined;
  const about = getData("about") as AboutSection["data"] | undefined;
  const experience = getData("experience") as
    | ExperienceSection["data"]
    | undefined;
  const education = getData("education") as
    | EducationSection["data"]
    | undefined;
  const skills = getData("skills") as SkillsSection["data"] | undefined;
  const socials = getData("socials") as SocialsSection["data"] | undefined;
  const footer = getData("footer") as FooterSection["data"] | undefined;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-6 md:flex-row md:gap-12">
      <div className="flex-1 space-y-10">
        {/* Header ------------------------------------------------------------------ */}
        <details open className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Header
          </summary>
          <form action={saveHeader} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={header?.name ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="tagline" className="text-sm font-medium">
                Tagline
              </label>
              <input
                id="tagline"
                name="tagline"
                defaultValue={header?.tagline ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="displayPicture" className="text-sm font-medium">
                Display picture URL
              </label>
              <input
                id="displayPicture"
                name="displayPicture"
                type="url"
                defaultValue={header?.displayPicture ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* About ------------------------------------------------------------------- */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            About
          </summary>
          <form action={saveAbout} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="markdown" className="text-sm font-medium">
                Markdown
              </label>
              <textarea
                id="markdown"
                name="markdown"
                rows={6}
                defaultValue={about?.markdown ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* Experience -------------------------------------------------------------- */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Experience (up to 3)
          </summary>
          <form action={saveExperience} className="mt-4 space-y-6">
            {[0, 1, 2].map((idx) => {
              const item = experience?.[idx];
              return (
                <fieldset key={idx} className="space-y-4 rounded-md border p-4">
                  <legend className="text-sm font-medium">
                    Position {idx + 1}
                  </legend>
                  <input
                    type="text"
                    name="company[]"
                    placeholder="Company"
                    defaultValue={item?.company ?? ""}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <input
                    type="text"
                    name="role[]"
                    placeholder="Role"
                    defaultValue={item?.role ?? ""}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <input
                    type="text"
                    name="location[]"
                    placeholder="Location"
                    defaultValue={item?.location ?? ""}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      name="start[]"
                      placeholder="Start (YYYY or YYYY-MM)"
                      defaultValue={item?.start ?? ""}
                      className="flex-1 rounded-md border px-3 py-2"
                    />
                    <input
                      type="text"
                      name="end[]"
                      placeholder="End (YYYY or YYYY-MM)"
                      defaultValue={item?.end ?? ""}
                      className="flex-1 rounded-md border px-3 py-2"
                    />
                  </div>
                </fieldset>
              );
            })}
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* Education --------------------------------------------------------------- */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Education (up to 3)
          </summary>
          <form action={saveEducation} className="mt-4 space-y-6">
            {[0, 1, 2].map((idx) => {
              const item = education?.[idx];
              return (
                <fieldset key={idx} className="space-y-4 rounded-md border p-4">
                  <legend className="text-sm font-medium">
                    Education {idx + 1}
                  </legend>
                  <input
                    type="text"
                    name="institution[]"
                    placeholder="Institution"
                    defaultValue={item?.institution ?? ""}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <input
                    type="text"
                    name="degree[]"
                    placeholder="Degree"
                    defaultValue={item?.degree ?? ""}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <div className="flex gap-4">
                    <input
                      type="text"
                      name="eduStart[]"
                      placeholder="Start (YYYY)"
                      defaultValue={item?.start ?? ""}
                      className="flex-1 rounded-md border px-3 py-2"
                    />
                    <input
                      type="text"
                      name="eduEnd[]"
                      placeholder="End (YYYY)"
                      defaultValue={item?.end ?? ""}
                      className="flex-1 rounded-md border px-3 py-2"
                    />
                  </div>
                </fieldset>
              );
            })}
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* Skills ------------------------------------------------------------------ */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Skills
          </summary>
          <form action={saveSkills} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="skills" className="text-sm font-medium">
                Comma-separated list
              </label>
              <input
                id="skills"
                name="skills"
                defaultValue={skills?.join(", ") ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* Socials ----------------------------------------------------------------- */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Social links (up to 5)
          </summary>
          <form action={saveSocials} className="mt-4 space-y-6">
            {[0, 1, 2, 3, 4].map((idx) => {
              const item = socials?.[idx];
              return (
                <div key={idx} className="flex gap-4">
                  <input
                    type="text"
                    name="platform[]"
                    placeholder="Platform"
                    defaultValue={item?.platform ?? ""}
                    className="flex-1 rounded-md border px-3 py-2"
                  />
                  <input
                    type="url"
                    name="url[]"
                    placeholder="URL"
                    defaultValue={item?.url ?? ""}
                    className="flex-1 rounded-md border px-3 py-2"
                  />
                </div>
              );
            })}
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>

        {/* Footer ------------------------------------------------------------------ */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Footer
          </summary>
          <form action={saveFooter} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="text" className="text-sm font-medium">
                Text
              </label>
              <input
                id="text"
                name="text"
                defaultValue={footer?.text ?? ""}
                className="rounded-md border px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          </form>
        </details>
      </div>

      {/* Live preview ------------------------------------------------------------- */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-full overflow-y-auto rounded-lg border p-6 md:block md:w-[32rem]">
        <h2 className="mb-4 text-lg font-semibold">Live preview</h2>
        {doc.length ? (
          <DefaultPortfolioTheme content={doc} />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Fill out the forms on the left, then hit "Save" to see a preview
              here.
            </p>
            <iframe
              src={`/${slugify(session.user.name)}`}
              className="h-full w-full"
            />
          </>
        )}
      </aside>
    </div>
  );
}
