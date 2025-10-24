import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Schema Interfaces for each content type
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
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    logo?: string;
    website?: string;
    technologies?: string[];
    current?: boolean;
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
    projects: ProjectSchema;
    experience: ExperienceSchema;
    blog: BlogSchema;
    gallery: GallerySchema;
    resume: ResumeSchema;
    info: Record<string, any>; // Info section is flexible
};

interface ContentItem {
    slug: string;
    order: number;
    frontmatter: Record<string, any>;
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

// Sections that use numbered files (1.md, 2.md, etc.)
const NUMBERED_SECTIONS = ['projects', 'experience', 'blog', 'gallery', 'resume'];

// Sections that use named files (bio.md, contact.md, etc.)
const NAMED_SECTIONS = ['info'];

// Allowed filename patterns for each section
const FILENAME_PATTERNS: Record<string, RegExp> = {
    projects: /^\d+\.md$/,
    experience: /^\d+\.md$/,
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
        .filter(item => {
            const itemPath = path.join(CONTENTS_DIR, item);
            return fs.statSync(itemPath).isDirectory();
        });
}

/**
 * Schema definitions - single source of truth
 * Define required fields with actual values, optional fields with undefined
 */
const SCHEMA_DEFINITIONS = {
    projects: {
        title: 'string',
        description: 'string',
        technologies: 'array',
        image: 'string',
        link: 'string?',
        github: 'string?',
        date: 'date?',
        status: 'string?',
        featured: 'boolean?'
    },
    experience: {
        title: 'string',
        company: 'string',
        location: 'string',
        startDate: 'date',
        endDate: 'date',
        description: 'string',
        logo: 'string?',
        website: 'string?',
        technologies: 'array?',
        current: 'boolean?'
    },
    blog: {
        title: 'string',
        date: 'date',
        author: 'string',
        excerpt: 'string',
        tags: 'array',
        image: 'string?',
        featured: 'boolean?',
        readTime: 'number?',
        category: 'string?'
    },
    gallery: {
        title: 'string',
        image: 'string',
        category: 'string',
        description: 'string?',
        date: 'date?',
        tags: 'array?',
        featured: 'boolean?'
    },
    resume: {
        title: 'string',
        type: 'string',
        description: 'string?',
        icon: 'string?',
        order: 'number?'
    },
    info: {}
} as const;

/**
 * Get schema metadata from definitions
 */
function getSchemaMetadata(section: keyof typeof SCHEMA_DEFINITIONS): {
    requiredFields: string[];
    optionalFields: string[];
    fieldTypes: Record<string, string>;
} {
    const schema = SCHEMA_DEFINITIONS[section];
    const requiredFields: string[] = [];
    const optionalFields: string[] = [];
    const fieldTypes: Record<string, string> = {};

    Object.entries(schema).forEach(([key, typeStr]) => {
        const isOptional = (typeStr as string).endsWith('?');
        const cleanType = isOptional ? (typeStr as string).slice(0, -1) : typeStr;

        if (isOptional) {
            optionalFields.push(key);
        } else {
            requiredFields.push(key);
        }

        fieldTypes[key] = cleanType as string;
    });

    return { requiredFields, optionalFields, fieldTypes };
}

/**
 * Type guard to check if value matches expected type
 */
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
    frontmatter: Record<string, any>,
    section: T
): string[] {
    const errors: string[] = [];

    // Skip validation for info section (flexible schema)
    if (section === 'info') return errors;

    // Get schema metadata from the interface
    const { requiredFields, optionalFields, fieldTypes } = getSchemaMetadata(section);

    // Check required fields
    requiredFields.forEach(field => {
        if (!(field in frontmatter)) {
            errors.push(`Missing required field: "${field}"`);
        } else if (frontmatter[field] === null || frontmatter[field] === undefined || frontmatter[field] === '') {
            errors.push(`Required field "${field}" is empty or null`);
        } else {
            const expectedType = fieldTypes[field];
            if (!isValidType(frontmatter[field], expectedType)) {
                errors.push(`Field "${field}" must be ${expectedType}, got ${getTypeName(frontmatter[field])}`);
            }
        }
    });

    // Check optional fields (only validate type if present)
    optionalFields.forEach(field => {
        if (field in frontmatter && frontmatter[field] !== null && frontmatter[field] !== undefined) {
            const expectedType = fieldTypes[field];
            if (!isValidType(frontmatter[field], expectedType)) {
                errors.push(`Field "${field}" must be ${expectedType}, got ${getTypeName(frontmatter[field])}`);
            }
        }
    });

    // Check for unexpected fields (strict mode)
    const allowedFields = [...requiredFields, ...optionalFields];
    Object.keys(frontmatter).forEach(field => {
        if (!allowedFields.includes(field)) {
            errors.push(`Unexpected field "${field}". Allowed: ${allowedFields.join(', ')}`);
        }
    });

    return errors;
}

/**
 * Validate markdown file content and structure
 */
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

    // Validate against schema interface
    if (section in FILENAME_PATTERNS && section !== 'info') {
        const schemaErrors = validateAgainstSchema(item.frontmatter, section as keyof SchemaMap);
        errors.push(...schemaErrors);
    }

    // Validate content exists
    if (!item.content || item.content.trim() === '') {
        warnings.push('Content is empty');
    }

    // Validate frontmatter structure
    if (Object.keys(item.frontmatter).length === 0 && section !== 'info') {
        warnings.push('No frontmatter found');
    }

    // Store validation results
    if (errors.length > 0) {
        validationErrors.push({
            file: filePath,
            section,
            lang,
            errors
        });
    }

    if (warnings.length > 0) {
        validationWarnings.push({
            file: filePath,
            section,
            lang,
            errors: warnings
        });
    }
}

/**
 * Parse a markdown file and return structured data
 */
function parseMarkdownFile(filePath: string, fileName: string, section: string, lang: string): ContentItem | null {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        // Extract order from filename (e.g., "1.md" -> 1)
        const match = fileName.match(/^(\d+)\.md$/);
        const order = match ? parseInt(match[1], 10) : 0;

        // Generate slug from filename without extension
        const slug = fileName.replace(/\.md$/, '');

        const item: ContentItem = {
            slug,
            order,
            frontmatter,
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

/**
 * Get all markdown files from a section directory
 */
function getSectionContent(langDir: string, section: string, lang: string): ContentItem[] {
    const sectionPath = path.join(langDir, section);

    if (!fs.existsSync(sectionPath)) {
        return [];
    }

    const files = fs.readdirSync(sectionPath)
        .filter(file => file.endsWith('.md'));

    const items = files
        .map(file => {
            const filePath = path.join(sectionPath, file);
            return parseMarkdownFile(filePath, file, section, lang);
        })
        .filter((item): item is ContentItem => item !== null); // Remove failed parses

    // Sort by order (number in filename)
    return items.sort((a, b) => a.order - b.order);
}

/**
 * Process all sections for a language
 */
function processLanguage(lang: string): LanguageData {
    const langDir = path.join(CONTENTS_DIR, lang);
    const data: LanguageData = {};

    // Get all sections available in this language directory
    if (!fs.existsSync(langDir)) {
        return data;
    }

    const sections = fs.readdirSync(langDir)
        .filter(item => {
            const itemPath = path.join(langDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

    // Process each section
    sections.forEach(section => {
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
    });

    return data;
}

/**
 * Print validation results
 */
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

/**
 * Generate content.json from all markdown files
 */
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
        console.log(`\n📝 Processing language: ${lang}`);
        allContent[lang] = processLanguage(lang);

        // Log sections found
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

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allContent, null, 2), 'utf-8');

    console.log(`\n✅ Content generated successfully!`);
    console.log(`📄 Output: ${OUTPUT_FILE}`);
    console.log(`📊 Total languages: ${languages.length}`);
    console.log(`💾 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);

    // Print validation results
    const validationResult = printValidationResults();

    // Exit with error code if validation failed
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