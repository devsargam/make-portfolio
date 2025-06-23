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
 * Retro portfolio theme ------------------------------------------------------
 *
 * A nostalgic theme inspired by 80s/90s aesthetics with bold colors,
 * retro fonts, and vintage computer terminal vibes.
 */

export interface RetroPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function RetroPortfolioTheme({ content }: RetroPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-black text-green-400 font-mono">
      {/* CRT screen effect overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-green-900/5 to-transparent animate-pulse" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0">
        {/* Terminal prompt decoration */}
        <div className="text-xs text-green-600">
          <span>user@portfolio:~$ </span>
          <span className="animate-pulse">_</span>
        </div>

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
        <div className="relative">
          <Image
            src={displayPicture}
            alt={name}
            width={128}
            height={128}
            className="h-32 w-32 object-cover border-2 border-green-400"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="absolute inset-0 bg-green-400/20 mix-blend-multiply" />
        </div>
      ) : null}
      <h1 className="text-4xl font-bold tracking-wider uppercase md:text-5xl">
        [{name}]
      </h1>
      {tagline ? (
        <p className="max-w-prose text-green-600 md:text-lg">&gt; {tagline}</p>
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
    <section className="prose prose-invert prose-green max-w-none">
      <div className="border border-green-400 p-4">
        <div className="mb-2 text-xs">
          ==[ ABOUT.TXT ]==================================================
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold uppercase">&gt;&gt; Experience</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1 border-l-4 border-green-400 pl-4">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-bold">
                {item.role} @ {item.company}
              </span>
              <span className="text-xs text-green-600 md:text-sm">
                [{item.start} - {item.end ?? "present"}]
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-green-600">// {item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="list-none pl-4 text-sm md:text-base">
                {item.highlights.map((hl, hlIdx) => (
                  <li key={hlIdx}>* {hl}</li>
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
      <h2 className="text-2xl font-bold uppercase">&gt;&gt; Education</h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-1 border-l-4 border-green-400 pl-4">
            <span className="font-bold">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <span className="text-xs text-green-600 md:text-sm">
              [{item.start} - {item.end ?? "present"}]
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
      <h2 className="text-2xl font-bold uppercase">&gt;&gt; Skills</h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="border border-green-400 bg-green-950 px-3 py-1 text-sm"
          >
            #{skill}
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
              className="underline-offset-4 hover:bg-green-400 hover:text-black px-1"
            >
              [{link.platform}]
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer({ data }: { data: FooterSection["data"] }) {
  return (
    <footer className="pt-12 text-center text-xs text-green-600">
      <div>EOF</div>
      <div>{data.text}</div>
    </footer>
  );
}