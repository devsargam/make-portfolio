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
 * Matrix portfolio theme -----------------------------------------------------
 *
 * Inspired by The Matrix movie aesthetic with falling digital rain,
 * green-on-black terminal styling, and cyberpunk elements.
 */

export interface MatrixPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function MatrixPortfolioTheme({ content }: MatrixPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-black text-green-500 font-mono relative overflow-hidden">
      {/* Matrix rain effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 text-xs text-green-500/20 animate-matrix-fall">
          10101010<br/>01010101<br/>11100111<br/>00110011
        </div>
        <div className="absolute top-0 left-1/2 text-xs text-green-500/30 animate-matrix-fall animation-delay-1000">
          01001101<br/>10110010<br/>11010110<br/>00101001
        </div>
        <div className="absolute top-0 left-3/4 text-xs text-green-500/20 animate-matrix-fall animation-delay-2000">
          11110000<br/>00001111<br/>10101010<br/>01010101
        </div>
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col gap-16 px-4 py-12 md:px-0">
        <div className="text-xs opacity-50">
          <span className="text-green-300">root@portfolio</span>
          <span className="text-white">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-white">$ </span>
          <span className="animate-pulse">█</span>
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
            className="h-32 w-32 object-cover border border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)]"
            style={{ filter: "sepia(100%) hue-rotate(90deg) saturate(2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/50" />
        </div>
      ) : null}
      <div>
        <div className="text-xs text-green-600 mb-2">
          === SYSTEM IDENTIFICATION ===
        </div>
        <h1 className="text-4xl font-bold tracking-wider md:text-5xl glitch" data-text={name}>
          {name}
        </h1>
        {tagline ? (
          <p className="mt-2 max-w-prose text-green-600 md:text-lg">
            &lt;{tagline}/&gt;
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
    <section className="prose prose-invert prose-green max-w-none">
      <div className="border border-green-500/50 p-4 bg-black/50">
        <div className="text-xs mb-2 opacity-50">
          cat about.md | more
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">
        <span className="text-green-300">$</span> ls -la /experience
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="border-l-2 border-green-500/50 pl-4">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-bold text-green-400">
                {item.role} <span className="text-green-600">@</span> {item.company}
              </span>
              <span className="text-xs text-green-700 font-mono">
                {item.start}.log - {item.end ?? "active"}.log
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-green-600">// {item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="mt-2 list-none text-sm text-green-500/90">
                {item.highlights.map((hl, hlIdx) => (
                  <li key={hlIdx}>
                    <span className="text-green-700">→</span> {hl}
                  </li>
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
      <h2 className="text-2xl font-bold">
        <span className="text-green-300">$</span> cat /etc/education.conf
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="border-l-2 border-green-500/50 pl-4">
            <span className="font-bold text-green-400">
              {item.degree ? `[${item.degree}] ` : ""}
              {item.institution}
            </span>
            <div className="text-xs text-green-700 font-mono">
              {item.start}.init - {item.end ?? "running"}.term
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skills({ data }: { data: SkillsSection["data"] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">
        <span className="text-green-300">$</span> dpkg --list | grep skills
      </h2>
      <ul className="flex flex-wrap gap-2">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="border border-green-500/50 bg-green-950/30 px-3 py-1 text-sm text-green-400"
          >
            <span className="text-green-600">[OK]</span> {skill}
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
      <div className="text-xs text-green-600 mb-2">
        === EXTERNAL CONNECTIONS ===
      </div>
      <ul className="flex flex-wrap justify-center gap-4">
        {data.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all"
            >
              ./link --to {link.platform}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer({ data }: { data: FooterSection["data"] }) {
  return (
    <footer className="pt-12 text-center text-xs text-green-700">
      <div>
        <span className="text-green-600">$</span> echo "{data.text}"
      </div>
      <div className="mt-2">
        <span className="animate-pulse">_</span>
      </div>
    </footer>
  );
}