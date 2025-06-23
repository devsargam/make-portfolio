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
 * Light portfolio theme ------------------------------------------------------
 *
 * A clean, bright theme with subtle shadows and plenty of whitespace,
 * perfect for a professional and modern look.
 */

export interface LightPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function LightPortfolioTheme({ content }: LightPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0">
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
      </div>
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
          className="h-32 w-32 rounded-full object-cover shadow-lg"
        />
      ) : null}
      <h1 className="text-4xl font-light tracking-wide text-gray-900 md:text-5xl">
        {name}
      </h1>
      {tagline ? (
        <p className="max-w-prose text-gray-600 md:text-lg">{tagline}</p>
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
    <section className="prose prose-gray max-w-none">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-light text-gray-900">Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-medium text-gray-900">
                {item.role} @ {item.company}
              </span>
              <span className="text-xs text-gray-500 md:text-sm">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-gray-600">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="list-inside list-disc pl-4 text-sm text-gray-700 md:text-base">
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
      <h2 className="text-2xl font-light text-gray-900">Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1 bg-white p-6 rounded-lg shadow-sm">
            <span className="font-medium text-gray-900">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <span className="text-xs text-gray-500 md:text-sm">
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
      <h2 className="text-2xl font-light text-gray-900">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700"
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
              className="text-gray-700 underline-offset-4 hover:text-gray-900 hover:underline"
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
    <footer className="pt-12 text-center text-xs text-gray-500">
      {data.text}
    </footer>
  );
}