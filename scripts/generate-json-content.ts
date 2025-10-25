import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {SkillCategory} from "@/lib/models/contract";

// Schema Interfaces for each content type
// =======================
// Education Schema
// =======================
export interface EducationSchema {
    /** Display title, e.g. "Master of Computer Science" */
    title: string;

    /** Name of the institution, e.g. "Technical University Berlin" */
    institution: string;

    /** Location of the institution, e.g. "Berlin, Germany" */
    location: string;

    /** Start date in ISO format, e.g. "2018-10-01" */
    startDate: string;

    /** End date in ISO format, e.g. "2020-09-30" */
    endDate: string;

    /** Short description of the education or major */
    description: string;

    /** Optional institution logo path */
    logo?: string;

    /** Degree type, e.g. "Bachelor's", "Master's", "PhD" */
    degree?: string;

    /** Final grade or GPA, e.g. "1.7" */
    grade?: string;

    /** Whether this should be featured on the website */
    featured?: boolean;

    /** Optional full markdown body content */
    body?: string;
}

interface ProjectSchema {
    title: string;
    description: string;
    technologies: string[];
    image: string;
    link?: string;
    github?: string;
    date?: string;
    status?: string;
    featured?: boolean;
}

interface ExperienceSchema {
    title: string;
    organization: string;
    location: string;
    current?: boolean;
    startDate: string;
    endDate: string;
    website?: string;
    technologies?: string[];
    description?: string;
    responsibilities?: string[];
    logo?: string;
}

interface BlogSchema {
    title: string;
    date: string;
    author: string;
    excerpt: string;
    tags: string[];
    image?: string;
    featured?: boolean;
    readTime?: number;
    category?: string;
}

interface GallerySchema {
    title: string;
    image: string;
    category: string;
    description?: string;
    date?: string;
    tags?: string[];
    featured?: boolean;
}

interface ResumeSchema {
    title: string;
    type: string;
    description?: string;
    icon?: string;
    order?: number;
}

// Section to Schema mapping
type SchemaMap = {
    education: EducationSchema;
    projects: ProjectSchema;
    experience: ExperienceSchema;
    skills: SkillCategory;
    blog: BlogSchema;
    gallery: GallerySchema;
    resume: ResumeSchema;
    info: Record<string, any>; // Info section is flexible
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

const CONTENTS_DIR = path.join(process.cwd(), 'contents');
const OUTPUT_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'content.json');

// Sections that use named files (bio.md, contact.md, etc.)
const NAMED_SECTIONS = ['info'];

// Allowed filename patterns for each section
const FILENAME_PATTERNS: Record<string, RegExp> = {
    projects: /^\d+\.md$/,
    experience: /^\d+\.md$/,
    education: /^\d+\.md$/,
    skills: /^[a-z-]+\.md$/,
    blog: /^\d+\.md$/,
    gallery: /^\d+\.md$/,
    resume: /^\d+\.md$/,
    info: /^[a-z-]+\.md$/
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

    return fs.readdirSync(CONTENTS_DIR)
        .filter(item => fs.statSync(path.join(CONTENTS_DIR, item)).isDirectory());
}
/**
 * Schema definitions - single source of truth
 * Define required fields with actual values, optional fields with undefined
 */
const TYPE_METADATA: Record<keyof SchemaMap, Record<string, { type: string; required: boolean }>> = {
    education: {
        title: { type: 'string', required: true },
        institution: { type: 'string', required: true },
        location: { type: 'string', required: true },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        description: { type: 'string', required: true },

        logo: { type: 'string', required: false },
        degree: { type: 'string', required: false },
        grade: { type: 'string', required: false },
        featured: { type: 'string', required: false },
        body: { type: 'string', required: false },
    },
    projects: {
        title: { type: 'string', required: true },
        description: { type: 'string', required: true },
        technologies: { type: 'array', required: true },
        image: { type: 'string', required: true },
        link: { type: 'string', required: false },
        github: { type: 'string', required: false },
        date: { type: 'date', required: false },
        status: { type: 'string', required: false },
        featured: { type: 'boolean', required: false }
    },
    experience: {
        title: { type: 'string', required: true },
        organization: { type: 'string', required: true },
        location: { type: 'string', required: true },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        description: { type: 'string', required: false },
        logo: { type: 'string', required: false },
        website: { type: 'string', required: false },
        technologies: { type: 'array', required: false },
        current: { type: 'boolean', required: false }
    },
    skills: {
        category: { type: 'string', required: true },
        items: { type: 'array', required: true },
    },
    blog: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
        author: { type: 'string', required: true },
        excerpt: { type: 'string', required: true },
        tags: { type: 'array', required: true },
        image: { type: 'string', required: false },
        featured: { type: 'boolean', required: false },
        readTime: { type: 'number', required: false },
        category: { type: 'string', required: false }
    },
    gallery: {
        title: { type: 'string', required: true },
        image: { type: 'string', required: true },
        category: { type: 'string', required: true },
        description: { type: 'string', required: false },
        date: { type: 'date', required: false },
        tags: { type: 'array', required: false },
        featured: { type: 'boolean', required: false }
    },
    resume: {
        title: { type: 'string', required: true },
        type: { type: 'string', required: true },
        description: { type: 'string', required: false },
        icon: { type: 'string', required: false },
        order: { type: 'number', required: false }
    },
    info: {}
};

function isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number';
        case 'boolean':
            return typeof value === 'boolean';
        case 'array':
            return Array.isArray(value);
        case 'date':
            return typeof value === 'string' && !isNaN(Date.parse(value));
        default:
            return true;
    }
}

/**
 * Get TypeScript type as string from value
 */
function getTypeName(value: any): string {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return typeof value;
}

/**
 * Validate frontmatter against schema interface
 */
function validateAgainstSchema<T extends keyof SchemaMap>(
    data: Record<string, any>,
    section: T
): string[] {
    const errors: string[] = [];

    // Skip validation for info section (flexible schema)
    if (section === 'info') return errors;

    const metadata = TYPE_METADATA[section];
    const requiredFields = Object.entries(metadata)
        .filter(([_, meta]) => meta.required)
        .map(([field]) => field);

    const allowedFields = Object.keys(metadata);

    // Check required fields
    for (const field of requiredFields) {
        if (!(field in data)) {
            errors.push(`Missing required field: "${field}"`);
        } else if (data[field] === null || data[field] === undefined || data[field] === '') {
            errors.push(`Required field "${field}" is empty or null`);
        } else {
            const expectedType = metadata[field].type;
            if (!isValidType(data[field], expectedType)) {
                errors.push(`Field "${field}" must be ${expectedType}, got ${getTypeName(data[field])}`);
            }
        }
    }

    // Check optional fields (only validate type if present)
    for (const [field, meta] of Object.entries(metadata)) {
        if (!meta.required && field in data && data[field] !== null && data[field] !== undefined) {
            if (!isValidType(data[field], meta.type)) {
                errors.push(`Field "${field}" must be ${meta.type}, got ${getTypeName(data[field])}`);
            }
        }
    }

    // Check for unexpected fields
    for (const field of Object.keys(data)) {
        if (!allowedFields.includes(field)) {
            errors.push(`Unexpected field "${field}". Allowed: ${allowedFields.join(', ')}`);
        }
    }

    return errors;
}

function validateMarkdownFile(
    filePath: string,
    fileName: string,
    section: string,
    lang: string,
    item: ContentItem
): void {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate filename pattern
    const pattern = FILENAME_PATTERNS[section];
    if (pattern && !pattern.test(fileName)) {
        errors.push(`Invalid filename pattern. Expected: ${pattern}`);
    }

    // Validate against schema interface (exclude slug, order, content from validation)
    if (section in FILENAME_PATTERNS && section !== 'info') {
        const { slug, order, content, ...dataToValidate } = item;
        const schemaErrors = validateAgainstSchema(dataToValidate, section as keyof SchemaMap);
        errors.push(...schemaErrors);
    }

    // Validate content exists
    if (!item.content || item.content.trim() === '') {
        warnings.push('Content is empty');
    }

    // Store validation results
    if (errors.length > 0) {
        validationErrors.push({ file: filePath, section, lang, errors });
    }

    if (warnings.length > 0) {
        validationWarnings.push({ file: filePath, section, lang, errors: warnings });
    }
}

function parseMarkdownFile(filePath: string, fileName: string, section: string, lang: string): ContentItem | null {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        // Extract order from filename (e.g., "1.md" -> 1)
        const match = fileName.match(/^(\d+)\.md$/);
        const order = match ? parseInt(match[1], 10) : 0;

        // Generate slug from filename without extension
        const slug = fileName.replace(/\.md$/, '');

        // Merge frontmatter fields directly with slug, order, and content
        const item: ContentItem = {
            slug,
            order,
            ...frontmatter,
            content: content.trim()
        };

        // Validate the parsed content
        validateMarkdownFile(filePath, fileName, section, lang, item);

        return item;
    } catch (error) {
        validationErrors.push({
            file: filePath,
            section,
            lang,
            errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
        return null;
    }
}

function getSectionContent(langDir: string, section: string, lang: string): ContentItem[] {
    const sectionPath = path.join(langDir, section);

    if (!fs.existsSync(sectionPath)) {
        return [];
    }

    const files = fs.readdirSync(sectionPath).filter(file => file.endsWith('.md'));

    const items = files
        .map(file => parseMarkdownFile(path.join(sectionPath, file), file, section, lang))
        .filter((item): item is ContentItem => item !== null);

    return items.sort((a, b) => a.order - b.order);
}

function processLanguage(lang: string): LanguageData {
    const langDir = path.join(CONTENTS_DIR, lang);
    const data: LanguageData = {};

    if (!fs.existsSync(langDir)) {
        return data;
    }

    const sections = fs.readdirSync(langDir)
        .filter(item => fs.statSync(path.join(langDir, item)).isDirectory());

    for (const section of sections) {
        const content = getSectionContent(langDir, section, lang);

        if (content.length > 0) {
            // For 'info' section, convert array to object with slugs as keys
            if (NAMED_SECTIONS.includes(section)) {
                const infoObj: SectionData = {};
                content.forEach(item => {
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
        console.log('\n❌ VALIDATION ERRORS:');
        validationErrors.forEach(({ file, section, lang, errors }) => {
            console.log(`\n  File: ${file}`);
            console.log(`  Section: ${section} | Language: ${lang}`);
            errors.forEach(err => console.log(`    ✗ ${err}`));
        });
    }

    if (hasWarnings) {
        console.log('\n⚠️  VALIDATION WARNINGS:');
        validationWarnings.forEach(({ file, section, lang, errors }) => {
            console.log(`\n  File: ${file}`);
            console.log(`  Section: ${section} | Language: ${lang}`);
            errors.forEach(warn => console.log(`    ⚠ ${warn}`));
        });
    }

    if (!hasErrors && !hasWarnings) {
        console.log('\n✅ All files passed validation!');
    }

    return {
        isValid: !hasErrors,
        errors: validationErrors,
        warnings: validationWarnings
    };
}

function generateContent(): void {
    console.log('🚀 Starting content generation...');

    const languages = getLanguages();

    if (languages.length === 0) {
        console.error('❌ No language directories found in contents/');
        process.exit(1);
    }

    console.log(`📁 Found languages: ${languages.join(', ')}`);

    const allContent: AllContent = {};

    languages.forEach(lang => {
        console.log(`\n🔍 Processing language: ${lang}`);
        allContent[lang] = processLanguage(lang);

        const sections = Object.keys(allContent[lang]);
        if (sections.length > 0) {
            console.log(`   ✓ Sections: ${sections.join(', ')}`);
            sections.forEach(section => {
                const items = allContent[lang][section];
                const count = Array.isArray(items) ? items.length : Object.keys(items).length;
                console.log(`     - ${section}: ${count} item(s)`);
            });
        } else {
            console.log(`   ⚠ No content found`);
        }
    });

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allContent, null, 2), 'utf-8');

    console.log(`\n✅ Content generated successfully!`);
    console.log(`📄 Output: ${OUTPUT_FILE}`);
    console.log(`📊 Total languages: ${languages.length}`);
    console.log(`💾 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);

    const validationResult = printValidationResults();

    if (!validationResult.isValid) {
        console.log('\n❌ Build failed due to validation errors.');
        console.log('💡 Fix the errors above and try again.');
        process.exit(1);
    }
}

// Run the generator
try {
    generateContent();
} catch (error) {
    console.error('❌ Error generating content:', error);
    process.exit(1);
}