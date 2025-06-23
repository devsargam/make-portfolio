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
 * Midnight portfolio theme ---------------------------------------------------
 *
 * A visually dark theme built on deep blues and subtle purples. It mirrors the
 * structure of `DefaultPortfolioTheme` but overrides the Tailwind utility
 * classes so that content pops in low-light environments without straining the
 * eyes.
 */

export interface MidnightPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function MidnightPortfolioTheme({
  content,
}: MidnightPortfolioThemeProps) {
  return (
    <section className="bg-gradient-to-b from-[#0d0b1e] via-[#0a1a32] to-[#061325] text-slate-200">
      <main className="mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0 bg-gradient-to-b from-[#0d0b1e] via-[#0a1a32] to-[#061325] text-slate-200">
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
    </section>
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
          className="h-32 w-32 rounded-full object-cover ring-4 ring-[#3a2da5]"
        />
      ) : null}
      <h1 className="text-3xl font-extrabold tracking-tight text-[#90a7ff] md:text-5xl">
        {name}
      </h1>
      {tagline ? (
        <p className="max-w-prose text-[#cbd5ff] md:text-lg">{tagline}</p>
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
    <section className="prose prose-slate dark:prose-invert text-slate-200 prose-h1:text-[#90a7ff] prose-h2:text-[#a5b4ff] prose-h3:text-[#cbd5ff] prose-h4:text-[#d0dcff] prose-h5:text-[#d0dcff] prose-h6:text-[#d0dcff]">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-[#a5b4ff]">Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-medium text-[#d0dcff]">
                {item.role} @ {item.company}
              </span>
              <span className="text-xs text-slate-400 md:text-sm">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-slate-400">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="list-inside list-disc pl-4 text-sm md:text-base marker:text-[#6366f1]">
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
      <h2 className="text-2xl font-semibold text-[#a5b4ff]">Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1">
            <span className="font-medium text-[#d0dcff]">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <span className="text-xs text-slate-400 md:text-sm">
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
      <h2 className="text-2xl font-semibold text-[#a5b4ff]">Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-md bg-[#1e293b] px-3 py-1 text-sm text-[#cbd5ff]"
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
              className="text-[#8b9aff] underline-offset-4 hover:underline"
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
    <footer className="pt-12 text-center text-xs text-slate-500">
      {data.text}
    </footer>
  );
}
