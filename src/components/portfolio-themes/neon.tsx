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
 * Neon portfolio theme -------------------------------------------------------
 *
 * A cyberpunk-inspired theme with glowing neon effects, dark backgrounds,
 * and electric colors that create a futuristic atmosphere.
 */

export interface NeonPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function NeonPortfolioTheme({ content }: NeonPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

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
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <Image
            src={displayPicture}
            alt={name}
            width={128}
            height={128}
            className="relative h-32 w-32 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.5)]"
          />
        </div>
      ) : null}
      <div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-600 animate-pulse md:text-6xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-4 max-w-prose text-gray-400 md:text-lg">
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
    <section className="prose prose-invert max-w-none border border-pink-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(255,0,255,0.3)]">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
        Experience
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="border border-cyan-500/30 rounded-lg p-6 bg-cyan-950/20 shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-semibold text-pink-400">
                {item.role} @ {item.company}
              </span>
              <span className="text-sm text-gray-500">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-gray-400">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="mt-3 list-inside list-disc pl-4 text-gray-300">
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
      <h2 className="text-3xl font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
        Education
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="border border-pink-500/30 rounded-lg p-6 bg-pink-950/20 shadow-[inset_0_0_20px_rgba(255,0,255,0.1)]">
            <span className="font-semibold text-cyan-400">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <div className="text-sm text-gray-500">
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
      <h2 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
        Skills
      </h2>
      <ul className="flex flex-wrap gap-3">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full border border-cyan-400 bg-black px-4 py-2 text-sm font-medium text-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5),inset_0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.8),inset_0_0_20px_rgba(0,255,255,0.5)] transition-all"
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
              className="font-medium text-pink-400 hover:text-cyan-400 hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all"
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
    <footer className="pt-12 text-center text-sm text-gray-600">
      {data.text}
    </footer>
  );
}