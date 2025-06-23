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
 * Pink portfolio theme -------------------------------------------------------
 *
 * This variant offers a softer, more playful look by introducing a pink colour
 * palette, rounded shapes and a cursive font stack while keeping the exact
 * same API as the default theme.
 */

export interface PinkPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function PinkPortfolioTheme({ content }: PinkPortfolioThemeProps) {
  return (
    <main className="relative mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0 font-[cursive] text-pink-900">
      {/* Decorative blurred bubble */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pink-300 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-200 opacity-20 blur-3xl" />

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
    <header className="relative flex flex-col items-center gap-4 text-center">
      {/* Decorative swirl */}
      <div className="pointer-events-none absolute -right-10 -top-8 h-32 w-32 rotate-45 rounded-full bg-pink-100 opacity-60 blur-2xl" />

      {displayPicture ? (
        <Image
          src={displayPicture}
          alt={name}
          width={128}
          height={128}
          className="h-32 w-32 rounded-full border-4 border-pink-300 object-cover shadow-md"
        />
      ) : null}
      <h1 className="text-4xl font-extrabold tracking-tight text-pink-600 md:text-5xl">
        {name}
      </h1>
      {tagline ? (
        <p className="max-w-prose text-pink-700 md:text-lg">{tagline}</p>
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
    <section className="prose prose-pink dark:prose-invert">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-pink-700">Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-medium text-pink-600">
                {item.role} @ {item.company}
              </span>
              <span className="text-xs text-pink-500 md:text-sm">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-pink-500">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="list-inside list-disc pl-4 text-sm text-pink-800 md:text-base">
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
      <h2 className="text-2xl font-semibold text-pink-700">Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <span className="font-medium text-pink-600">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <span className="text-xs text-pink-500 md:text-sm">
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
      <h2 className="text-2xl font-semibold text-pink-700">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700 shadow-sm"
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
              className="text-pink-600 underline-offset-4 hover:underline"
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
    <footer className="pt-12 text-center text-xs text-pink-500">
      {data.text}
    </footer>
  );
}
