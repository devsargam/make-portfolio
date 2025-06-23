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
 * Minimal portfolio theme ----------------------------------------------------
 *
 * Ultra-clean design with maximum whitespace, minimal colors, and focus on
 * typography and content hierarchy.
 */

export interface MinimalPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function MinimalPortfolioTheme({ content }: MinimalPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-20 px-6 py-20 md:px-0">
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
    <header className="flex flex-col gap-8">
      {displayPicture ? (
        <Image
          src={displayPicture}
          alt={name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover grayscale"
        />
      ) : null}
      <div>
        <h1 className="text-3xl font-light text-black md:text-4xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-2 text-gray-600">{tagline}</p>
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
    <section className="prose prose-gray prose-sm max-w-none">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Experience
      </h2>
      <ul className="space-y-8">
        {data.map((item, idx) => (
          <li key={idx} className="flex flex-col gap-2">
            <div>
              <div className="font-medium text-black">
                {item.role}
              </div>
              <div className="text-sm text-gray-600">
                {item.company}
                {item.location ? ` · ${item.location}` : ""}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {item.start} – {item.end ?? "present"}
              </div>
            </div>
            {item.highlights?.length ? (
              <ul className="list-none space-y-1 text-sm text-gray-700">
                {item.highlights.map((hl, hlIdx) => (
                  <li key={hlIdx}>· {hl}</li>
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
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Education
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx}>
            <div className="font-medium text-black">
              {item.degree || item.institution}
            </div>
            {item.degree && (
              <div className="text-sm text-gray-600">
                {item.institution}
              </div>
            )}
            <div className="mt-1 text-xs text-gray-500">
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
    <section className="flex flex-col gap-8">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Skills
      </h2>
      <div className="text-sm text-gray-700">
        {data.join(" · ")}
      </div>
    </section>
  );
}

function Socials({ data }: { data: SocialsSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Connect
      </h2>
      <ul className="flex gap-4 text-sm">
        {data.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
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
    <footer className="mt-20 border-t pt-8 text-center text-xs text-gray-400">
      {data.text}
    </footer>
  );
}