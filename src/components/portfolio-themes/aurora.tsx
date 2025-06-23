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
 * Aurora portfolio theme -----------------------------------------------------
 *
 * Inspired by the Northern Lights with flowing gradients, soft glows,
 * and ethereal color transitions creating a dreamy atmosphere.
 */

export interface AuroraPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function AuroraPortfolioTheme({ content }: AuroraPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Aurora effect background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-aurora-1" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-green-500/20 rounded-full filter blur-3xl animate-aurora-2" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-aurora-3" />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0">
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
    <header className="flex flex-col items-center gap-6 text-center">
      {displayPicture ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse" />
          <Image
            src={displayPicture}
            alt={name}
            width={128}
            height={128}
            className="relative h-32 w-32 rounded-full object-cover border-2 border-white/20"
          />
        </div>
      ) : null}
      <div>
        <h1 className="text-5xl font-light tracking-wide md:text-6xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-4 max-w-prose text-slate-300 md:text-lg">
            {tagline}
          </p>
        ) : null}
      </div>
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
    <section className="prose prose-invert max-w-none">
      <div className="rounded-2xl bg-white/5 backdrop-blur-md p-8 border border-white/10">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-light text-blue-300">Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="rounded-2xl bg-white/5 backdrop-blur-md p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-medium text-green-300">
                {item.role} @ {item.company}
              </span>
              <span className="text-sm text-slate-400">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-slate-400">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="mt-3 list-inside list-disc pl-4 text-slate-300">
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
      <h2 className="text-3xl font-light text-purple-300">Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="rounded-2xl bg-white/5 backdrop-blur-md p-6 border border-white/10">
            <span className="font-medium text-blue-300">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <div className="text-sm text-slate-400">
              {item.start} – {item.end ?? "present"}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skills({ data }: { data: SkillsSection["data"] }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-3xl font-light text-green-300">Skills</h2>
      <ul className="flex flex-wrap gap-3">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 backdrop-blur-md px-4 py-2 text-sm font-medium border border-white/20"
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
      <ul className="flex flex-wrap justify-center gap-6">
        {data.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-green-300 transition-colors duration-300"
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
    <footer className="pt-12 text-center text-sm text-slate-500">
      {data.text}
    </footer>
  );
}