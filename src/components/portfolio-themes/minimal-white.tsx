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
 * Minimal White portfolio theme ----------------------------------------------
 *
 * An ultra-minimalist theme with pure white background, subtle borders,
 * and extreme focus on typography and negative space.
 */

export interface MinimalWhitePortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function MinimalWhitePortfolioTheme({ content }: MinimalWhitePortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-xl flex-col gap-24 px-8 py-24 md:px-0">
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
    <header className="flex flex-col gap-6">
      {displayPicture ? (
        <Image
          src={displayPicture}
          alt={name}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : null}
      <div>
        <h1 className="text-2xl font-normal text-black">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-1 text-sm text-gray-500">{tagline}</p>
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
    <section className="prose prose-sm prose-gray max-w-none">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xs uppercase tracking-widest text-gray-400">
        Experience
      </h2>
      <ul className="space-y-8">
        {data.map((item, idx) => (
          <li key={idx} className="border-l border-gray-200 pl-4">
            <div className="text-sm font-medium text-black">
              {item.role}
            </div>
            <div className="text-xs text-gray-600">
              {item.company}
            </div>
            <div className="mt-0.5 text-xs text-gray-400">
              {item.start} – {item.end ?? "present"}
            </div>
            {item.highlights?.length ? (
              <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
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
    <section className="flex flex-col gap-6">
      <h2 className="text-xs uppercase tracking-widest text-gray-400">
        Education
      </h2>
      <ul className="space-y-4">
        {data.map((item, idx) => (
          <li key={idx} className="border-l border-gray-200 pl-4">
            <div className="text-sm font-medium text-black">
              {item.degree || item.institution}
            </div>
            {item.degree && (
              <div className="text-xs text-gray-600">
                {item.institution}
              </div>
            )}
            <div className="mt-0.5 text-xs text-gray-400">
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
      <h2 className="text-xs uppercase tracking-widest text-gray-400">
        Skills
      </h2>
      <div className="text-xs text-gray-600 leading-relaxed">
        {data.join(", ")}
      </div>
    </section>
  );
}

function Socials({ data }: { data: SocialsSection["data"] }) {
  return (
    <section>
      <ul className="flex gap-3 text-xs">
        {data.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black transition-colors"
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
    <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
      {data.text}
    </footer>
  );
}