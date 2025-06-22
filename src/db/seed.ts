import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { config } from "dotenv";
import * as schema from "./index";
import type { PortfolioDocument } from "./portfolio-schema";

config({ path: ".env" });

// -----------------------------------------------------------------------------
// Pre-baked portfolio sections that will be attached to every seeded portfolio
// -----------------------------------------------------------------------------
const dummyPortfolioData: PortfolioDocument = [
  {
    section: "header",
    data: {
      name: "Alex Johnson",
      tagline: "Full Stack Developer & UI/UX Enthusiast",
      displayPicture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    },
  },
  {
    section: "about",
    data: {
      markdown: `# About Me\n\nI'm a passionate full-stack developer with 5+ years of experience building modern web applications. I love creating intuitive user experiences and scalable backend systems.\n\n## What I Do\n- Build responsive web applications using React and TypeScript\n- Design and implement RESTful APIs and GraphQL endpoints\n- Optimize database performance and architecture\n- Collaborate with cross-functional teams to deliver high-quality products\n\nWhen I'm not coding, you can find me hiking, reading tech blogs, or experimenting with new technologies.`,
    },
  },
  {
    section: "experience",
    data: [
      {
        company: "TechCorp Solutions",
        role: "Senior Full Stack Developer",
        location: "San Francisco, CA",
        start: "2022-03",
        end: "present",
        highlights: [
          "Led development of a customer portal serving 10,000+ users",
          "Reduced API response times by 40% through optimization",
          "Mentored 3 junior developers and conducted code reviews",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
        ],
      },
      {
        company: "StartupXYZ",
        role: "Frontend Developer",
        location: "Remote",
        start: "2020-06",
        end: "2022-02",
        highlights: [
          "Built responsive React applications from scratch",
          "Collaborated with designers to implement pixel-perfect UIs",
          "Integrated third-party APIs and payment systems",
          "Improved application performance by 35%",
        ],
      },
      {
        company: "Digital Agency Inc",
        role: "Junior Web Developer",
        location: "New York, NY",
        start: "2019-01",
        end: "2020-05",
        highlights: [
          "Developed WordPress themes and custom plugins",
          "Created landing pages with high conversion rates",
          "Maintained and updated client websites",
          "Learned modern JavaScript frameworks and tools",
        ],
      },
    ],
  },
  {
    section: "education",
    data: [
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        start: "2015-09",
        end: "2019-05",
      },
      {
        institution: "FreeCodeCamp",
        degree: "Full Stack Web Development Certification",
        start: "2018-06",
        end: "2018-12",
      },
    ],
  },
  {
    section: "skills",
    data: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "PostgreSQL",
      "MongoDB",
      "GraphQL",
      "REST APIs",
      "Docker",
      "AWS",
      "Git",
      "Jest",
      "Cypress",
      "Figma",
      "Tailwind CSS",
      "Python",
    ],
  },
  {
    section: "socials",
    data: [
      {
        platform: "github",
        url: "https://github.com/alexjohnson",
      },
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/alexjohnson-dev",
      },
      {
        platform: "email",
        url: "mailto:alex.johnson@email.com",
      },
      {
        platform: "website",
        url: "https://alexjohnson.dev",
      },
    ],
  },
  {
    section: "footer",
    data: {
      text: "© 2024 Alex Johnson. Built with Next.js and deployed on Vercel.",
    },
  },
];

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  await seed(db, schema, {
    // Global number of rows when a specific count is not defined per table
    count: 5,
    // Use a fixed seed so we get the same data each run.
    seed: 42,
  }).refine((f) => ({
    /* ---------------------------------------------------------------------
     * Users
     * -------------------------------------------------------------------*/
    user: {
      // Create ten distinct users
      count: 10,
      columns: {
        id: f.uuid(),
        name: f.fullName(),
        email: f.email(),
        emailVerified: f.boolean(),
        image: f.default({ defaultValue: "" }),
      },
      // Every user gets exactly one portfolio
      with: {
        portfolio: 1,
      },
    },

    /* ---------------------------------------------------------------------
     * Portfolios
     * -------------------------------------------------------------------*/
    portfolio: {
      columns: {
        id: f.uuid(),
        username: f.firstName(),
        // Attach the prepared dummy content to every generated portfolio
        content: f.default({ defaultValue: dummyPortfolioData }),
        published: f.boolean(),
      },
    },
  }));
}

main();
