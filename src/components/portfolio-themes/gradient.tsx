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
 * Gradient portfolio theme ---------------------------------------------------
 *
 * A vibrant theme featuring smooth gradient transitions, colorful backgrounds,
 * and modern design elements that create visual interest.
 */

export interface GradientPortfolioThemeProps {
  /** Parsed portfolio JSON coming from the database */
  readonly content: PortfolioDocument;
}

export function GradientPortfolioTheme({ content }: GradientPortfolioThemeProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-orange-400/20 animate-gradient-shift pointer-events-none" />

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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full blur-lg opacity-75 animate-pulse" />
          <Image
            src={displayPicture}
            alt={name}
            width={128}
            height={128}
            className="relative h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
          />
        </div>
      ) : null}
      <div>
        <h1 className="text-5xl font-extrabold">
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            {name}
          </span>
        </h1>
        {tagline ? (
          <p className="mt-4 max-w-prose text-gray-700 md:text-lg">
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
    <section className="prose prose-gray max-w-none rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-lg">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </section>
  );
}

function Experience({ data }: { data: ExperienceSection["data"] }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Experience
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="rounded-2xl bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between">
              <span className="font-semibold text-gray-900">
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
        Education
      </h2>
      <ul className="space-y-6">
        {data.map((item, idx) => (
          <li key={idx} className="rounded-2xl bg-gradient-to-r from-pink-100/80 to-orange-100/80 backdrop-blur-sm p-6 shadow-lg">
            <span className="font-semibold text-gray-900">
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
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
        Skills
      </h2>
      <ul className="flex flex-wrap gap-3">
        {data.map((skill, idx) => (
          <li
            key={idx}
            className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
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
              className="font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all"
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