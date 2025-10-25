import fs from "fs";
import path from "path";

// =======================
// CONFIGURATION
// =======================
const OUTPUT_DIR = path.join(__dirname, "../contents");
const LANGUAGES = ["en", "de", "fr", "es", "jp"];       // Configurable
const BLOG_COUNT = 3;                      // Configurable
const MAX_ITEM = 3;                 // Configurable

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
    const words = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Cloud", "Architecture"];
    return Array.from({ length: count })
        .map(() => fakeTranslate(
            Array.from({ length: 10 })
                .map(() => randomFrom(words))
                .join(" ") + ".",
            lang
        ))
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
    const tags = ["tech", "javascript", "typescript", "react"].sort(() => 0.5 - Math.random()).slice(0, 2);
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
tags: [${tags.map(t => `"${t}"`).join(", ")}]
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
    const technologies = ["React", "TypeScript", "Next.js", "Node.js"].sort(() => 0.5 - Math.random()).slice(0, 2);
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
technologies: [${technologies.map(t => `"${t}"`).join(", ")}]
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
    const description = fakeTranslate(`Led development team for ${organization}.`, lang);
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
technologies: [${technologies.map(t => `"${t}"`).join(", ")}]
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
    const tags = ["tech", "javascript", "typescript", "react"].sort(() => 0.5 - Math.random()).slice(0, 2);
    const featured = Math.random() > 0.8;
    const body = generateParagraphs(3, lang);

    return `---
title: "${title}"
image: "${image}"
category: "${category}"
description: "${description}"
date: "${date}"
tags: [${tags.map(t => `"${t}"`).join(", ")}]
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
        "University of Hamburg"
    ]);
    const location = randomFrom([
        "Berlin, Germany",
        "Munich, Germany",
        "Cologne, Germany",
        "Hamburg, Germany"
    ]);
    const startYear = 2015 + (id % 5);
    const endYear = startYear + 2;
    const startDate = `${startYear}-10-01`;
    const endDate = `${endYear}-09-30`;
    const description = `Completed a degree in Computer Science with focus on ${randomFrom([
        "Artificial Intelligence",
        "Cloud Computing",
        "Software Engineering",
        "Data Science",
        "Cybersecurity"
    ])}.`;
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

type SkillCategory = {
    category: string;
    items: string[];
};

function generateSkills(lang: string): string {
    const categories: SkillCategory[] = [
        { category: "Programming", items: ["Python", "TypeScript", "Java", "C++"] },
        { category: "Tools & Cloud", items: ["AWS", "Docker", "Kubernetes"] },
        { category: "Soft Skills", items: ["Leadership", "Communication", "Mentoring"] },
        { category: "Design & Creative", items: ["Photoshop", "Figma", "Adobe Illustrator"] },
        { category: "Languages", items: ["English", "German", "French"] },
    ];

    // Convert categories to YAML
    const yamlContent = categories
        .map(
            (cat) =>
                `- category: "${cat.category}"\n  items:\n${cat.items
                    .map((item) => `    - "${item}"`)
                    .join("\n")}`
        )
        .join("\n");

    return `---
# Skills for language: ${lang}
${yamlContent}
---
`;
}

function getOrCreateDir(lang: string, name: string) {
    const dirName = path.join(OUTPUT_DIR, lang, name);

    fs.mkdirSync(dirName, {recursive: true});

    return dirName;
}

// =======================
// MAIN
// =======================
for (const lang of LANGUAGES) {
    const blogDir = getOrCreateDir(lang, "blog");
    const projectDir = getOrCreateDir(lang, "projects");
    const educationDir = getOrCreateDir(lang, "education");
    const expDir = getOrCreateDir(lang, "experience");
    const galleryDir = getOrCreateDir(lang, "gallery");
    const infoDir = getOrCreateDir(lang, "info");

    for (let i = 1; i <= BLOG_COUNT; i++) {
        fs.writeFileSync(path.join(blogDir, `${i}.md`), generateBlog(i, lang), "utf8");
    }

    for (let i = 1; i <= MAX_ITEM; i++) {
        fs.writeFileSync(path.join(projectDir, `${i}.md`), generateProject(i, lang), "utf8");
    }

    for (let i = 1; i <= MAX_ITEM; i++) {
        fs.writeFileSync(path.join(educationDir, `${i}.md`), generateEducation(i, lang), "utf8");
    }

    for (let i = 1; i <= MAX_ITEM; i++) {
        fs.writeFileSync(path.join(expDir, `${i}.md`), generateExperience(i, lang), "utf8");
    }

    fs.writeFileSync(path.join(infoDir, `skills.md`), generateSkills(lang), "utf8");

    for (let i = 1; i <= MAX_ITEM; i++) {
        fs.writeFileSync(path.join(galleryDir, `${i}.md`), generateGallery(i, lang), "utf8");
    }

    console.log(`✅ Generated ${MAX_ITEM} Education, ${BLOG_COUNT} blogs, ${MAX_ITEM} projects, ${MAX_ITEM} experiences, ${MAX_ITEM} gallery for ${lang}`);
}

console.log("🎉 All multilingual content generated successfully!");
