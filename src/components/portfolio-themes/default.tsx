import Image from "next/image";
import type {
  PortfolioDocument,
  HeaderSection,
  AboutSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  SocialsSection,
  FooterSection,
} from "@/db/portfolio-schema";
import { remark } from "remark";
import html from "remark-html";

/*
 * Default portfolio theme ----------------------------------------------------
 *
 * This component renders every section defined in a PortfolioDocument.
 * All markup is intentionally minimal, leveraging TailwindCSS utility
 * classes that correspond to the design-tokens declared in `globals.css`.
 */

export interface DefaultPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function DefaultPortfolioTheme({ content }: DefaultPortfolioThemeProps) {
  console.log(content);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0">
      {content.map((section, idx) => {
        switch (section.section) {
          case "header":
            return <Header key={idx} data={section.data} />;
          case "about":
            return <About key={idx} data={section.data} />;
          case "experience":
            return <Experience key={idx} data={section.data} />;
          case "education":
            return <Education key={idx} data={section.data} />;
          case "skills":
            return <Skills key={idx} data={section.data} />;
          case "socials":
            return <Socials key={idx} data={section.data} />;
          case "footer":
            return <Footer key={idx} data={section.data} />;
          default:
            return null;
        }
      })}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                               */
/* -------------------------------------------------------------------------- */

function Header({ data }: { data: HeaderSection["data"] }) {
  const { name, tagline, displayPicture } = data;

  return (
    <header className="flex flex-col items-center gap-4 text-center">
      {displayPicture ? (
        <Image
          src={displayPicture}
          alt={name}
          width={128}
          height={128}
          className="h-32 w-32 rounded-full object-cover"
        />
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{name}</h1>
      {tagline ? (
        <p className="max-w-prose text-muted-foreground md:text-lg">
          {tagline}
        </p>
      ) : null}
    </header>
  );
}

async function About({ data }: { data: AboutSection["data"] }) {
  async function markdownToHtml(markdown: string): Promise<string> {
    const processedContent = await remark().use(html).process(markdown);
    return processedContent.toString();
  }

  const htmlContent = await markdownToHtml(data.markdown);

  return (
    <section className="prose prose-slate dark:prose-invert">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold">Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-medium text-primary">
                {item.role} @ {item.company}
              </span>
              <span className="text-xs text-muted-foreground md:text-sm">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-muted-foreground">
                {item.location}
              </span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="list-inside list-disc pl-4 text-sm md:text-base">
                {item.highlights.map((hl, hlIdx) => (
                  <li key={hlIdx}>{hl}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Education({ data }: { data: EducationSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold">Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <span className="font-medium text-primary">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <span className="text-xs text-muted-foreground md:text-sm">
              {item.start} – {item.end ?? "present"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skills({ data }: { data: SkillsSection["data"] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Socials({ data }: { data: SocialsSection["data"] }) {
  return (
    <section className="flex flex-col items-center gap-4">
      <h2 className="sr-only">Social links</h2>
      <ul className="flex flex-wrap justify-center gap-4">
        {data.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {link.platform}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer({ data }: { data: FooterSection["data"] }) {
  return (
    <footer className="pt-12 text-center text-xs text-muted-foreground">
      {data.text}
    </footer>
  );
}
