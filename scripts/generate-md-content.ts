import fs from "fs";
import path from "path";

// =======================
// CONFIGURATION
// =======================
const OUTPUT_DIR = path.join(__dirname, "../contents");
const LANGUAGES = ["en", "de", "fr", "es", "jp"];       // Configurable
const BLOG_COUNT = 512;                      // Configurable
const PROJECT_COUNT = 128;                    // Configurable
const EXPERIENCE_COUNT = 64;                 // Configurable

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
        case "de": return `🇩🇪 (DE) ${text}`;
        case "fr": return `🇫🇷 (FR) ${text}`;
        default: return text; // English unchanged
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
image: "${image}"
link: "${link}"
github: "${github}"
date: "${date}"
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
    const company = `Tech Corp ${id}`;
    const location = "Berlin, Germany";
    const startDate = "2020-01-01";
    const endDate = "2024-01-01";
    const description = fakeTranslate(`Led development team for ${company}.`, lang);
    const logo = `/images/company-logo-${id}.png`;
    const website = `https://company${id}.com`;
    const technologies = ["Node.js", "React"];
    const current = false;

    const body = generateParagraphs(3, lang);

    return `---
title: "${title}"
company: "${company}"
location: "${location}"
startDate: "${startDate}"
endDate: "${endDate}"
description: "${description}"
logo: "${logo}"
website: "${website}"
technologies: [${technologies.map(t => `"${t}"`).join(", ")}]
current: ${current}
---

${body}
`;
}

// =======================
// MAIN
// =======================
for (const lang of LANGUAGES) {
    const blogDir = path.join(OUTPUT_DIR, lang, "blog");
    const projectDir = path.join(OUTPUT_DIR, lang, "projects");
    const expDir = path.join(OUTPUT_DIR, lang, "experience");

    fs.mkdirSync(blogDir, { recursive: true });
    fs.mkdirSync(projectDir, { recursive: true });
    fs.mkdirSync(expDir, { recursive: true });

    for (let i = 1; i <= BLOG_COUNT; i++) {
        fs.writeFileSync(path.join(blogDir, `${i}.md`), generateBlog(i, lang), "utf8");
    }

    for (let i = 1; i <= PROJECT_COUNT; i++) {
        fs.writeFileSync(path.join(projectDir, `${i}.md`), generateProject(i, lang), "utf8");
    }

    for (let i = 1; i <= EXPERIENCE_COUNT; i++) {
        fs.writeFileSync(path.join(expDir, `${i}.md`), generateExperience(i, lang), "utf8");
    }

    console.log(`✅ Generated ${BLOG_COUNT} blogs, ${PROJECT_COUNT} projects, ${EXPERIENCE_COUNT} experiences for ${lang}`);
}

console.log("🎉 All multilingual content generated successfully!");
