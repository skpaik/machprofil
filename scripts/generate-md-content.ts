import fs from "fs";
import path from "path";
import {
  CertificationSchema,
  ReferenceSchema,
  LanguageProficiencySchema,
  PublicationSchema,
  SkillCategorySchema,
  SocialLinkSchema,
  ContactSchema,
  BioSchema,
} from "@/lib/models/contract";

// =======================
// CONFIGURATION
// =======================
const OUTPUT_DIR = path.join(__dirname, "../contents");
const LANGUAGES = ["en", "de", "fr", "es", "jp"]; // Configurable
const BLOG_COUNT = 1; // Configurable
const MAX_ITEM = 1; // Configurable

// =======================
// HELPER FUNCTIONS
// =======================
function randomDate(): string {
  return `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Mock DeepL-style translation (no API key needed)
function fakeTranslate(text: string, lang: string): string {
  switch (lang) {
    case "de":
      return `🇩🇪 (DE) ${text}`;
    case "fr":
      return `🇫🇷 (FR) ${text}`;
    default:
      return text; // English unchanged
  }
}

function generateParagraphs(count: number, lang: string): string {
  const words = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Cloud",
    "Architecture",
  ];
  return Array.from({ length: count })
    .map(() =>
      fakeTranslate(
        Array.from({ length: 10 })
          .map(() => randomFrom(words))
          .join(" ") + ".",
        lang,
      ),
    )
    .join("\n\n");
}

// =======================
// BLOG GENERATOR
// =======================
function generateBlog(id: number, lang: string): string {
  const title = `My Blog Post ${id} (${lang.toUpperCase()})`;
  const date = randomDate();
  const author = randomFrom(["John Doe", "Jane Smith", "Alex Johnson"]);
  const excerpt = `A short summary for blog post ${id} in ${lang.toUpperCase()}.`;
  const tags = ["tech", "javascript", "typescript", "react"]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  const image = `/images/blog-${id}.jpg`;
  const featured = Math.random() > 0.8;
  const readTime = Math.floor(Math.random() * 10) + 3;
  const category = randomFrom(["Tutorial", "Guide", "Opinion"]);

  const body = generateParagraphs(5, lang);

  return `---
title: "${title}"
date: "${date}"
author: "${author}"
excerpt: "${excerpt}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
image: "${image}"
featured: ${featured}
readTime: ${readTime}
category: "${category}"
---

${body}
`;
}

// =======================
// PROJECT GENERATOR
// =======================
function generateProject(id: number, lang: string): string {
  const title = `My Project ${id} (${lang.toUpperCase()})`;
  const description = `Project ${id} overview in ${lang.toUpperCase()}.`;
  const technologies = ["React", "TypeScript", "Next.js", "Node.js"]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  const image = `/images/project-${id}.jpg`;
  const link = `https://example.com/projects/${id}`;
  const github = `https://github.com/user/project-${id}`;
  const date = randomDate();
  const status = randomFrom(["completed", "in-progress", "planned"]);
  const featured = Math.random() > 0.85;

  const body = generateParagraphs(4, lang);

  return `---
title: "${title}"
description: "${description}"
technologies: [${technologies.map((t) => `"${t}"`).join(", ")}]
link: "${link}"
github: "${github}"
date: "${date}"
image: "${image}"
status: "${status}"
featured: ${featured}
---

${body}
`;
}

// =======================
// EXPERIENCE GENERATOR
// =======================
function generateExperience(id: number, lang: string): string {
  const title = `Senior Developer ${id} (${lang.toUpperCase()})`;
  const organization = `Tech Corp ${id}`;
  const location = "Berlin, Germany";
  const startDate = "2020-01-01";
  const endDate = "2024-01-01";
  const description = fakeTranslate(
    `Led development team for ${organization}.`,
    lang,
  );
  const logo = `/images/organization-logo-${id}.png`;
  const website = `https://company${id}.com`;
  const technologies = ["Node.js", "React"];
  const current = false;

  const body = generateParagraphs(3, lang);

  return `---
title: "${title}"
organization: "${organization}"
location: "${location}"
current: ${current}
startDate: "${startDate}"
endDate: "${endDate}"
website: "${website}"
technologies: [${technologies.map((t) => `"${t}"`).join(", ")}]
description: "${description}"
responsibilities:
  - "Responsibility 1 for experience ${id}"
  - "Responsibility 2 for experience ${id}"
  - "Responsibility 3 for experience ${id}"
logo: "${logo}"
---

${body}
`;
}

// =======================
// Gallery GENERATOR
// =======================
function generateGallery(id: number, lang: string): string {
  const title = `Senior Developer ${id} (${lang.toUpperCase()})`;
  const image = `/images/gallery-${id}.jpg`;
  const category = randomFrom(["Tutorial", "Guide", "Opinion"]);
  const description = `Project ${id} overview in ${lang.toUpperCase()}.`;
  const date = "2020-01-01";
  const tags = ["tech", "javascript", "typescript", "react"]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  const featured = Math.random() > 0.8;
  const body = generateParagraphs(3, lang);

  return `---
title: "${title}"
image: "${image}"
category: "${category}"
description: "${description}"
date: "${date}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
featured: ${featured}
---

${body}
`;
}

// =======================
// EDUCATION GENERATOR
// =======================
function generateEducation(id: number, lang: string): string {
  const title = `Education ${id} (${lang.toUpperCase()})`;
  const institution = randomFrom([
    "Technical University Berlin",
    "University of Munich",
    "Humboldt University",
    "RWTH Aachen",
    "University of Hamburg",
  ]);
  const location = randomFrom([
    "Berlin, Germany",
    "Munich, Germany",
    "Cologne, Germany",
    "Hamburg, Germany",
  ]);
  const startYear = 2015 + (id % 5);
  const endYear = startYear + 2;
  const startDate = `${startYear}-10-01`;
  const endDate = `${endYear}-09-30`;
  const description = `Completed a degree in Computer Science with focus on ${randomFrom(
    [
      "Artificial Intelligence",
      "Cloud Computing",
      "Software Engineering",
      "Data Science",
      "Cybersecurity",
    ],
  )}.`;
  const logo = `/images/education-${id}.png`;
  const degree = randomFrom(["Bachelor's", "Master's", "Diploma", "PhD"]);
  const grade = randomFrom(["1.3", "1.7", "2.0", "2.3"]);
  const featured = Math.random() > 0.8;
  const body = generateParagraphs(3, lang);

  return `---
title: "${title}"
institution: "${institution}"
location: "${location}"
startDate: "${startDate}"
endDate: "${endDate}"
description: "${description}"
logo: "${logo}"
degree: "${degree}"
grade: "${grade}"
featured: ${featured}
---

${body}
`;
}

function generateSkills(lang: string): string {
  const categories: SkillCategorySchema[] = [
    { category: "Programming", items: ["Python", "TypeScript", "Java", "C++"] },
    { category: "Tools & Cloud", items: ["AWS", "Docker", "Kubernetes"] },
    {
      category: "Soft Skills",
      items: ["Leadership", "Communication", "Mentoring"],
    },
    {
      category: "Design & Creative",
      items: ["Photoshop", "Figma", "Adobe Illustrator"],
    },
    { category: "Languages", items: ["English", "German", "French"] },
  ];

  // Convert categories to properly indented YAML under skill_list
  const yamlSkillList = categories
    .map(
      (cat) =>
        `  - category: "${cat.category}"\n    items:\n${cat.items
          .map((item) => `      - "${item}"`)
          .join("\n")}`,
    )
    .join("\n");

  // Full markdown file content
  return `---
title: "Skills for language: ${lang}"
skill_list:
${yamlSkillList}
---

NA
`;
}

function generateCertification(i: number, lang: string): string {
  const cert: CertificationSchema = {
    name: `Certification ${i}`,
    organization: `Organization ${i}`,
    issueDate: `202${i}-01`,
    expirationDate: `202${i + 2}-01`,
    credentialId: `CERT-${1000 + i}`,
    credentialUrl: `https://example.com/certifications/${i}`,
    skills: ["Skill A", "Skill B", "Skill C"],
    media: [`https://example.com/media/cert-${i}.jpg`],
    description: `Description of certification ${i} in ${lang}`,
  };

  // Convert skills and media arrays to YAML
  const skillsYaml = cert.skills?.map((s) => `  - "${s}"`).join("\n") ?? "";
  const mediaYaml = cert.media?.map((m) => `  - "${m}"`).join("\n") ?? "";

  return `---
name: "${cert.name}"
organization: "${cert.organization}"
issueDate: "${cert.issueDate}"
expirationDate: "${cert.expirationDate ?? ""}"
credentialId: "${cert.credentialId ?? ""}"
credentialUrl: "${cert.credentialUrl ?? ""}"
${skillsYaml ? `skills:\n${skillsYaml}` : ""}
${mediaYaml ? `media:\n${mediaYaml}` : ""}
description: "${cert.description ?? ""}"
---

NA
`;
}

function generatePublication(i: number, lang: string): string {
  const pub: PublicationSchema = {
    title: `Publication Title ${i}`,
    authors: [`Author A${i}`, `Author B${i}`],
    publisher: `Publisher ${i}`,
    date: `202${i}-06-01`,
    link: `https://example.com/publication/${i}`,
    doi: `10.1234/example-doi-${i}`,
    summary: `This is a brief summary of publication ${i} in ${lang}.`,
    keywords: ["Keyword1", "Keyword2", "Keyword3"],
    media: [`https://example.com/media/pub-${i}.jpg`],
  };

  const authorsYaml = pub.authors.map((a) => `  - "${a}"`).join("\n");
  const keywordsYaml = pub.keywords?.map((k) => `  - "${k}"`).join("\n") ?? "";
  const mediaYaml = pub.media?.map((m) => `  - "${m}"`).join("\n") ?? "";

  return `---
title: "${pub.title}"
authors:
${authorsYaml}
publisher: "${pub.publisher}"
date: "${pub.date}"
link: "${pub.link ?? ""}"
doi: "${pub.doi ?? ""}"
summary: "${pub.summary ?? ""}"
${keywordsYaml ? `keywords:\n${keywordsYaml}` : ""}
${mediaYaml ? `media:\n${mediaYaml}` : ""}
---

NA
`;
}

function generateLanguages(lang: string): string {
  const languages: LanguageProficiencySchema[] = [
    {
      name: "English",
      read: "Fluent",
      write: "Fluent",
      speak: "Fluent",
      listen: "Fluent",
      tests: ["IELTS", "TOEFL"],
      level: "C1",
    },
    {
      name: "German",
      read: "Intermediate",
      write: "Intermediate",
      speak: "Intermediate",
      listen: "Intermediate",
      tests: ["Goethe B2", "Telc B2"],
      level: "B2",
    },
    {
      name: "French",
      read: "Good",
      write: "Good",
      speak: "Intermediate",
      listen: "Good",
      level: "B1",
    },
  ];

  // Convert to properly indented YAML
  const yamlLanguages = languages
    .map((l) => {
      const testsYaml = l.tests
        ? `    tests:\n${l.tests.map((t) => `      - "${t}"`).join("\n")}\n`
        : "";
      return `  - name: "${l.name}"
    read: "${l.read}"
    write: "${l.write}"
    speak: "${l.speak}"
    listen: "${l.listen}"
${testsYaml}${l.level ? `    level: "${l.level}"\n` : ""}`;
    })
    .join("");

  return `---
title: "Languages for language: ${lang}"
language_list:
${yamlLanguages}
---

NA
`;
}

function generateInterest(lang: string): string {
  // Example interests; you can customize per profession or user
  const interests = [
    "Photography",
    "Traveling",
    "Open-source projects",
    "Reading",
    "Music",
    "Sports",
  ];

  const yamlContent = interests.map((item) => `  - "${item}"`).join("\n");

  return `---
# Interests for language: ${lang}
items:
${yamlContent}
---

NA
`;
}

function generateReferences(lang: string): string {
  const references: ReferenceSchema[] = [
    {
      name: "Dr. Laura Schmidt",
      position: "Engineering Manager",
      organization: "TechCorp GmbH",
      email: "laura.schmidt@techcorp.de",
      phone: "+49 1522 111222",
      relation: "Manager at TechCorp",
    },
    {
      name: "Prof. John Doe",
      position: "Professor of Computer Science",
      organization: "University of Hamburg",
      email: "j.doe@uni-hamburg.de",
      relation: "Thesis Supervisor",
    },
  ];

  const yamlReferences = references
    .map((ref) => {
      const lines = [
        `  - name: "${ref.name}"`,
        `    position: "${ref.position}"`,
        `    organization: "${ref.organization}"`,
        ref.email ? `    email: "${ref.email}"` : null,
        ref.phone ? `    phone: "${ref.phone}"` : null,
        ref.relation ? `    relation: "${ref.relation}"` : null,
        ref.notes ? `    notes: "${ref.notes}"` : null,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n");

  return `---
title: "References for language: ${lang}"
reference_list:
${yamlReferences}
---

NA
`;
}

function generateSocialLinks(lang: string): string {
  const links: SocialLinkSchema[] = [
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/alexjohnson",
      username: "alexjohnson",
    },
    {
      platform: "GitHub",
      url: "https://github.com/alexjohnson",
      username: "alexjohnson",
    },
    { platform: "Twitter", url: "https://twitter.com/alexjohnson" },
  ];

  const yamlLinks = links
    .map((link) => {
      const lines = [
        `  - platform: "${link.platform}"`,
        `    url: "${link.url}"`,
        link.username ? `    username: "${link.username}"` : null,
        link.description ? `    description: "${link.description}"` : null,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n");

  return `---
title: "Social Links for language: ${lang}"
social_links:
${yamlLinks}
---

NA
`;
}

function generateContacts(lang: string): string {
  const contacts: ContactSchema[] = [
    { type: "Email", value: "alex@example.com", label: "Work" },
    { type: "Phone", value: "+49 1522 1234567", label: "Mobile" },
    { type: "Website", value: "https://alexjohnson.dev", label: "Website" },
    {
      type: "Address",
      value: "Berlin, Germany",
      description: "Current residence",
    },
  ];

  const yamlContacts = contacts
    .map((c) => {
      const lines = [
        `  - type: "${c.type}"`,
        `    value: "${c.value}"`,
        c.label ? `    label: "${c.label}"` : null,
        c.description ? `    description: "${c.description}"` : null,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n");

  return `---
title: "Contacts for language: ${lang}"
contact_list:
${yamlContacts}
---

NA
`;
}

function generateBio(lang: string): string {
  const bio: BioSchema = {
    fullName: "Alex Johnson",
    title: "Software Engineer",
    summary:
      "Experienced developer passionate about building scalable systems and mentoring others.",
    location: "Berlin, Germany",
    dob: "1990-05-12",
    photo: "https://example.com/photos/alex.jpg",
  };

  return `---
# Bio for language: ${lang}
fullName: "${bio.fullName}"
title: "${bio.title}"
summary: "${bio.summary}"
location: "${bio.location}"
${bio.dob ? `dob: "${bio.dob}"` : ""}
${bio.photo ? `photo: "${bio.photo}"` : ""}
---

NA
`;
}

function getOrCreateDir(lang: string, name: string) {
  const dirName = path.join(OUTPUT_DIR, lang, name);

  fs.mkdirSync(dirName, { recursive: true });

  return dirName;
}

// =======================
// MAIN
// =======================
for (const lang of LANGUAGES) {
  const blogDir = getOrCreateDir(lang, "blog_list");
  const projectDir = getOrCreateDir(lang, "project_list");
  const educationDir = getOrCreateDir(lang, "education_list");
  const expDir = getOrCreateDir(lang, "experience_list");
  const galleryDir = getOrCreateDir(lang, "gallery_list");
  const infoDir = getOrCreateDir(lang, "info");
  const certDir = getOrCreateDir(lang, "certificate_list");
  const publishDir = getOrCreateDir(lang, "publication_list");

  for (let i = 1; i <= BLOG_COUNT; i++) {
    fs.writeFileSync(
      path.join(blogDir, `${i}.md`),
      generateBlog(i, lang),
      "utf8",
    );
  }

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(projectDir, `${i}.md`),
      generateProject(i, lang),
      "utf8",
    );
  }

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(educationDir, `${i}.md`),
      generateEducation(i, lang),
      "utf8",
    );
  }

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(expDir, `${i}.md`),
      generateExperience(i, lang),
      "utf8",
    );
  }

  fs.writeFileSync(path.join(infoDir, `bio.md`), generateBio(lang), "utf8");
  fs.writeFileSync(
    path.join(infoDir, `skills.md`),
    generateSkills(lang),
    "utf8",
  );
  fs.writeFileSync(
    path.join(infoDir, `languages.md`),
    generateLanguages(lang),
    "utf8",
  );
  fs.writeFileSync(
    path.join(infoDir, `interest.md`),
    generateInterest(lang),
    "utf8",
  );
  fs.writeFileSync(
    path.join(infoDir, `reference.md`),
    generateReferences(lang),
    "utf8",
  );
  fs.writeFileSync(
    path.join(infoDir, `social.md`),
    generateSocialLinks(lang),
    "utf8",
  );
  fs.writeFileSync(
    path.join(infoDir, `contact.md`),
    generateContacts(lang),
    "utf8",
  );

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(galleryDir, `${i}.md`),
      generateGallery(i, lang),
      "utf8",
    );
  }

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(certDir, `${i}.md`),
      generateCertification(i, lang),
      "utf8",
    );
  }

  for (let i = 1; i <= MAX_ITEM; i++) {
    fs.writeFileSync(
      path.join(publishDir, `${i}.md`),
      generatePublication(i, lang),
      "utf8",
    );
  }

  console.log(
    `✅ Generated ${BLOG_COUNT} Blogs, ${MAX_ITEM} Certificate, Education, Experiences, Gallery, Projects, Publication and Info for ${lang}`,
  );
}

console.log("🎉 All multilingual content generated successfully!");
