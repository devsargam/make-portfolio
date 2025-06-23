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
 * Modern portfolio theme -----------------------------------------------------
 *
 * A sleek, contemporary design with glassmorphism effects, smooth gradients,
 * and modern typography for a cutting-edge look.
 */

export interface ModernPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function ModernPortfolioTheme({ content }: ModernPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 opacity-10 blur-3xl animate-pulse" />
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
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <Image
            src={displayPicture}
            alt={name}
            width={128}
            height={128}
            className="relative h-32 w-32 rounded-full object-cover"
          />
        </div>
      ) : null}
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent md:text-6xl">
          {name}
        </h1>
        {tagline ? (
          <p className="mt-4 max-w-prose text-gray-600 md:text-lg">
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
    <section className="prose prose-gray max-w-none backdrop-blur-sm bg-white/30 rounded-2xl p-8 shadow-xl">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Experience
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-semibold text-gray-900 text-lg">
                {item.role} @ {item.company}
              </span>
              <span className="text-sm text-gray-600">
                {item.start} – {item.end ?? "present"}
              </span>
            </div>
            {item.location ? (
              <span className="text-sm text-gray-600">{item.location}</span>
            ) : null}
            {item.highlights?.length ? (
              <ul className="mt-3 list-inside list-disc pl-4 text-gray-700">
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Education
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="backdrop-blur-sm bg-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
            <span className="font-semibold text-gray-900 text-lg">
              {item.degree ? `${item.degree}, ` : ""}
              {item.institution}
            </span>
            <div className="text-sm text-gray-600">
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Skills
      </h2>
      <ul className="flex flex-wrap gap-3">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-shadow"
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
              className="font-medium text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:bg-clip-text transition-all"
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
    <footer className="pt-12 text-center text-sm text-gray-500">
      {data.text}
    </footer>
  );
}