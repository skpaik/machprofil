import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  BlogSchema,
  CertificationSchema,
  EducationSchema,
  ExperienceSchema,
  GallerySchema,
  ProjectSchema,
  PublicationSchema,
} from "@/lib/models/contract";

// Schema Interfaces for each content type
// =======================
// Education Schema
// =======================

// Section to Schema mapping
type SchemaMap = {
  blog_list: BlogSchema;
  certificate_list: CertificationSchema;
  education_list: EducationSchema;
  experience_list: ExperienceSchema;
  gallery_list: GallerySchema;
  info: Record<string, any>; // Info section is flexible
  project_list: ProjectSchema;
  publication_list: PublicationSchema;
};

interface ContentItem extends Record<string, any> {
  slug: string;
  order: number;
  content: string;
}

interface SectionData {
  [key: string]: ContentItem[];
}

interface LanguageData {
  [section: string]: SectionData | ContentItem[];
}

interface AllContent {
  [lang: string]: LanguageData;
}

interface ValidationError {
  file: string;
  section: string;
  lang: string;
  errors: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const CONTENTS_DIR = path.join(process.cwd(), "contents");
const OUTPUT_DIR = path.join(process.cwd(), "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "content.json");

// Sections that use named files (bio.md, contact.md, etc.)
const NAMED_SECTIONS = ["info"];

// Allowed filename patterns for each section
const FILENAME_PATTERNS: Record<string, RegExp> = {
  blog_list: /^\d+\.md$/,
  certificate_list: /^\d+\.md$/,
  education_list: /^\d+\.md$/,
  experience_list: /^\d+\.md$/,
  gallery_list: /^\d+\.md$/,
  info: /^[a-z-]+\.md$/,
  project_list: /^\d+\.md$/,
  publication_list: /^\d+\.md$/,
};

const validationErrors: ValidationError[] = [];
const validationWarnings: ValidationError[] = [];

/**
 * Get all available languages from contents folder
 */
function getLanguages(): string[] {
  if (!fs.existsSync(CONTENTS_DIR)) {
    console.warn(`Contents directory not found: ${CONTENTS_DIR}`);
    return [];
  }

  return fs
    .readdirSync(CONTENTS_DIR)
    .filter((item) => fs.statSync(path.join(CONTENTS_DIR, item)).isDirectory());
}
/**
 * Schema definitions - single source of truth
 * Define required fields with actual values, optional fields with undefined
 */
const TYPE_METADATA: Record<
  keyof SchemaMap,
  Record<string, { type: string; required: boolean }>
> = {
  blog_list: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
    author: { type: "string", required: true },
    excerpt: { type: "string", required: true },
    tags: { type: "array", required: true },
    image: { type: "string", required: false },
    featured: { type: "boolean", required: false },
    readTime: { type: "number", required: false },
    category: { type: "string", required: false },
  },
  certificate_list: {
    name: { type: "string", required: true },
    organization: { type: "string", required: true },
    issueDate: { type: "date", required: true },
    expirationDate: { type: "date", required: false },
    credentialId: { type: "string", required: false },
    credentialUrl: { type: "string", required: false },
    skills: { type: "array", required: true },
    media: { type: "array", required: true },
    description: { type: "string", required: false },
  },
  education_list: {
    title: { type: "string", required: true },
    institution: { type: "string", required: true },
    location: { type: "string", required: true },
    startDate: { type: "date", required: true },
    endDate: { type: "date", required: true },
    description: { type: "string", required: true },

    logo: { type: "string", required: false },
    degree: { type: "string", required: false },
    grade: { type: "string", required: false },
    featured: { type: "boolean", required: false },
    body: { type: "string", required: false },
  },
  experience_list: {
    title: { type: "string", required: true },
    organization: { type: "string", required: true },
    location: { type: "string", required: true },
    startDate: { type: "date", required: true },
    endDate: { type: "date", required: true },
    description: { type: "string", required: false },
    responsibilities: { type: "array", required: false },
    logo: { type: "string", required: false },
    website: { type: "string", required: false },
    technologies: { type: "array", required: false },
    current: { type: "boolean", required: false },
  },
  gallery_list: {
    title: { type: "string", required: true },
    image: { type: "string", required: true },
    category: { type: "string", required: true },
    description: { type: "string", required: false },
    date: { type: "date", required: false },
    tags: { type: "array", required: false },
    featured: { type: "boolean", required: false },
  },
  info: {},
  project_list: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    technologies: { type: "array", required: true },
    image: { type: "string", required: true },
    link: { type: "string", required: false },
    github: { type: "string", required: false },
    date: { type: "date", required: false },
    status: { type: "string", required: false },
    featured: { type: "boolean", required: false },
  },
  publication_list: {
    title: { type: "string", required: true },
    authors: { type: "array", required: true },
    publisher: { type: "string", required: true },
    date: { type: "date", required: false },
    link: { type: "string", required: false },
    doi: { type: "string", required: false },
    summary: { type: "string", required: false },
    keywords: { type: "array", required: false },
    media: { type: "array", required: false },
  },
};

function isValidType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "date":
      return typeof value === "string" && !isNaN(Date.parse(value));
    default:
      return true;
  }
}

/**
 * Get TypeScript type as string from value
 */
function getTypeName(value: any): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return typeof value;
}

/**
 * Validate frontmatter against schema interface
 */
function validateAgainstSchema<T extends keyof SchemaMap>(
  data: Record<string, any>,
  section: T,
): string[] {
  const errors: string[] = [];

  // Skip validation for info section (flexible schema)
  if (section === "info") return errors;

  const metadata = TYPE_METADATA[section];
  const requiredFields = Object.entries(metadata)
    .filter(([_, meta]) => meta.required)
    .map(([field]) => field);

  const allowedFields = Object.keys(metadata);

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: "${field}"`);
    } else if (
      data[field] === null ||
      data[field] === undefined ||
      data[field] === ""
    ) {
      errors.push(`Required field "${field}" is empty or null`);
    } else {
      const expectedType = metadata[field].type;
      if (!isValidType(data[field], expectedType)) {
        errors.push(
          `Field "${field}" must be ${expectedType}, got ${getTypeName(data[field])}`,
        );
      }
    }
  }

  // Check optional fields (only validate type if present)
  for (const [field, meta] of Object.entries(metadata)) {
    if (
      !meta.required &&
      field in data &&
      data[field] !== null &&
      data[field] !== undefined
    ) {
      if (!isValidType(data[field], meta.type)) {
        errors.push(
          `Field "${field}" must be ${meta.type}, got ${getTypeName(data[field])}`,
        );
      }
    }
  }

  // Check for unexpected fields
  for (const field of Object.keys(data)) {
    if (!allowedFields.includes(field)) {
      errors.push(
        `Unexpected field "${field}". Allowed: ${allowedFields.join(", ")}`,
      );
    }
  }

  return errors;
}

function validateMarkdownFile(
  filePath: string,
  fileName: string,
  section: string,
  lang: string,
  item: ContentItem,
): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate filename pattern
  const pattern = FILENAME_PATTERNS[section];
  if (pattern && !pattern.test(fileName)) {
    errors.push(`Invalid filename pattern. Expected: ${pattern}`);
  }

  // Validate against schema interface (exclude slug, order, content from validation)
  if (section in FILENAME_PATTERNS && section !== "info") {
    const { slug, order, content, ...dataToValidate } = item;
    const schemaErrors = validateAgainstSchema(
      dataToValidate,
      section as keyof SchemaMap,
    );
    errors.push(...schemaErrors);
  }

  // Validate content exists
  if (!item.content || item.content.trim() === "") {
    warnings.push("Content is empty");
  }

  // Store validation results
  if (errors.length > 0) {
    validationErrors.push({ file: filePath, section, lang, errors });
  }

  if (warnings.length > 0) {
    validationWarnings.push({
      file: filePath,
      section,
      lang,
      errors: warnings,
    });
  }
}

function parseMarkdownFile(
  filePath: string,
  fileName: string,
  section: string,
  lang: string,
): ContentItem | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);

    // Extract order from filename (e.g., "1.md" -> 1)
    const match = fileName.match(/^(\d+)\.md$/);
    const order = match ? parseInt(match[1], 10) : 0;

    // Generate slug from filename without extension
    const slug = fileName.replace(/\.md$/, "");

    // Merge frontmatter fields directly with slug, order, and content
    const item: ContentItem = {
      slug,
      order,
      ...frontmatter,
      content: content.trim(),
    };

    // Validate the parsed content
    validateMarkdownFile(filePath, fileName, section, lang, item);

    return item;
  } catch (error) {
    validationErrors.push({
      file: filePath,
      section,
      lang,
      errors: [
        `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    });
    return null;
  }
}

function getSectionContent(
  langDir: string,
  section: string,
  lang: string,
): ContentItem[] {
  const sectionPath = path.join(langDir, section);

  if (!fs.existsSync(sectionPath)) {
    return [];
  }

  const files = fs
    .readdirSync(sectionPath)
    .filter((file) => file.endsWith(".md"));

  const items = files
    .map((file) =>
      parseMarkdownFile(path.join(sectionPath, file), file, section, lang),
    )
    .filter((item): item is ContentItem => item !== null);

  return items.sort((a, b) => a.order - b.order);
}

function processLanguage(lang: string): LanguageData {
  const langDir = path.join(CONTENTS_DIR, lang);
  const data: LanguageData = {};

  if (!fs.existsSync(langDir)) {
    return data;
  }

  const sections = fs
    .readdirSync(langDir)
    .filter((item) => fs.statSync(path.join(langDir, item)).isDirectory());

  for (const section of sections) {
    const content = getSectionContent(langDir, section, lang);

    if (content.length > 0) {
      // For 'info' section, convert array to object with slugs as keys
      if (NAMED_SECTIONS.includes(section)) {
        const infoObj: SectionData = {};
        content.forEach((item) => {
          infoObj[item.slug] = [item];
        });
        data[section] = infoObj;
      } else {
        data[section] = content;
      }
    }
  }

  return data;
}

function printValidationResults(): ValidationResult {
  const hasErrors = validationErrors.length > 0;
  const hasWarnings = validationWarnings.length > 0;

  if (hasErrors) {
    console.log("\n❌ VALIDATION ERRORS:");
    validationErrors.forEach(({ file, section, lang, errors }) => {
      console.log(`\n  File: ${file}`);
      console.log(`  Section: ${section} | Language: ${lang}`);
      errors.forEach((err) => console.log(`    ✗ ${err}`));
    });
  }

  if (hasWarnings) {
    console.log("\n⚠️  VALIDATION WARNINGS:");
    validationWarnings.forEach(({ file, section, lang, errors }) => {
      console.log(`\n  File: ${file}`);
      console.log(`  Section: ${section} | Language: ${lang}`);
      errors.forEach((warn) => console.log(`    ⚠ ${warn}`));
    });
  }

  if (!hasErrors && !hasWarnings) {
    console.log("\n✅ All files passed validation!");
  }

  return {
    isValid: !hasErrors,
    errors: validationErrors,
    warnings: validationWarnings,
  };
}

function generateContent(): void {
  console.log("🚀 Starting content generation...");

  const languages = getLanguages();

  if (languages.length === 0) {
    console.error("❌ No language directories found in contents/");
    process.exit(1);
  }

  console.log(`📁 Found languages: ${languages.join(", ")}`);

  const allContent: AllContent = {};

  languages.forEach((lang) => {
    console.log(`\n🔍 Processing language: ${lang}`);
    allContent[lang] = processLanguage(lang);

    const sections = Object.keys(allContent[lang]);
    if (sections.length > 0) {
      console.log(`   ✓ Sections: ${sections.join(", ")}`);
      sections.forEach((section) => {
        const items = allContent[lang][section];
        const count = Array.isArray(items)
          ? items.length
          : Object.keys(items).length;
        console.log(`     - ${section}: ${count} item(s)`);
      });
    } else {
      console.log(`   ⚠ No content found`);
    }
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allContent, null, 2), "utf-8");

  console.log(`\n✅ Content generated successfully!`);
  console.log(`📄 Output: ${OUTPUT_FILE}`);
  console.log(`📊 Total languages: ${languages.length}`);
  console.log(
    `💾 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`,
  );

  const validationResult = printValidationResults();

  if (!validationResult.isValid) {
    console.log("\n❌ Build failed due to validation errors.");
    console.log("💡 Fix the errors above and try again.");
    process.exit(1);
  }
}

// Run the generator
try {
  generateContent();
} catch (error) {
  console.error("❌ Error generating content:", error);
  process.exit(1);
}
