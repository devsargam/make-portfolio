import { db } from "@/db/drizzle";
import { portfolio } from "@/db";
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
import {
  saveHeader,
  saveAbout,
  saveSkills,
  saveSocials,
  saveFooter,
  saveExperience,
  saveEducation,
} from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  // Unique timestamp so that the iframe reloads whenever the page is
  // re-rendered after a successful form submission.
  const now = Date.now();
  const previewUrl = `/${slugify(session.user.name)}?v=${now}`;

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
              <Label htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={header?.name ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tagline">
                Tagline
              </Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={header?.tagline ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="displayPicture">
                Display picture URL
              </Label>
              <Input
                id="displayPicture"
                name="displayPicture"
                type="url"
                defaultValue={header?.displayPicture ?? ""}
              />
            </div>

            <Button type="submit">
              Save
            </Button>
          </form>
        </details>

        {/* About ------------------------------------------------------------------- */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            About
          </summary>
          <form action={saveAbout} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="markdown">
                Markdown
              </Label>
              <Textarea
                id="markdown"
                name="markdown"
                rows={6}
                defaultValue={about?.markdown ?? ""}
              />
            </div>
            <Button type="submit">
              Save
            </Button>
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
                  <Input
                    type="text"
                    name="company[]"
                    placeholder="Company"
                    defaultValue={item?.company ?? ""}
                  />
                  <Input
                    type="text"
                    name="role[]"
                    placeholder="Role"
                    defaultValue={item?.role ?? ""}
                  />
                  <Input
                    type="text"
                    name="location[]"
                    placeholder="Location"
                    defaultValue={item?.location ?? ""}
                  />
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      name="start[]"
                      placeholder="Start (YYYY or YYYY-MM)"
                      defaultValue={item?.start ?? ""}
                      className="flex-1"
                    />
                    <Input
                      type="text"
                      name="end[]"
                      placeholder="End (YYYY or YYYY-MM)"
                      defaultValue={item?.end ?? ""}
                      className="flex-1"
                    />
                  </div>
                </fieldset>
              );
            })}
            <Button type="submit">
              Save
            </Button>
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
                  <Input
                    type="text"
                    name="institution[]"
                    placeholder="Institution"
                    defaultValue={item?.institution ?? ""}
                  />
                  <Input
                    type="text"
                    name="degree[]"
                    placeholder="Degree"
                    defaultValue={item?.degree ?? ""}
                  />
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      name="eduStart[]"
                      placeholder="Start (YYYY)"
                      defaultValue={item?.start ?? ""}
                      className="flex-1"
                    />
                    <Input
                      type="text"
                      name="eduEnd[]"
                      placeholder="End (YYYY)"
                      defaultValue={item?.end ?? ""}
                      className="flex-1"
                    />
                  </div>
                </fieldset>
              );
            })}
            <Button type="submit">
              Save
            </Button>
          </form>
        </details>

        {/* Skills ------------------------------------------------------------------ */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Skills
          </summary>
          <form action={saveSkills} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="skills">
                Comma-separated list
              </Label>
              <Input
                id="skills"
                name="skills"
                defaultValue={skills?.join(", ") ?? ""}
              />
            </div>
            <Button type="submit">
              Save
            </Button>
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
                  <Input
                    type="text"
                    name="platform[]"
                    placeholder="Platform"
                    defaultValue={item?.platform ?? ""}
                    className="flex-1"
                  />
                  <Input
                    type="url"
                    name="url[]"
                    placeholder="URL"
                    defaultValue={item?.url ?? ""}
                    className="flex-1"
                  />
                </div>
              );
            })}
            <Button type="submit">
              Save
            </Button>
          </form>
        </details>

        {/* Footer ------------------------------------------------------------------ */}
        <details className="rounded-lg border p-6">
          <summary className="cursor-pointer text-lg font-semibold">
            Footer
          </summary>
          <form action={saveFooter} className="mt-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="text">
                Text
              </Label>
              <Input
                id="text"
                name="text"
                defaultValue={footer?.text ?? ""}
              />
            </div>
            <Button type="submit">
              Save
            </Button>
          </form>
        </details>
      </div>

      {/* Live preview ------------------------------------------------------------- */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-full overflow-y-auto rounded-lg border p-6 md:block md:w-[32rem]">
        <h2 className="mb-4 text-lg font-semibold">Live preview</h2>
        {/* Always show the portfolio page inside an iframe. By appending a unique
            timestamp query param (and using the same value as the key) the iframe
            unmounts and reloads on every server re-render, giving us an updated
            preview right after each form submission. */}
        <iframe key={now} src={previewUrl} className="h-full w-full" />
      </aside>
    </div>
  );
}
