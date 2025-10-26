export interface SkillCategorySchema {
  category: string;
  items: string[];
}

export interface CertificationSchema {
  name: string;
  organization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills?: string[];
  media?: string[];
  description?: string;
}

export interface PublicationSchema {
  title: string;
  authors: string[];
  publisher: string;
  date: string;
  link?: string;
  doi?: string;
  summary?: string;
  keywords?: string[];
  media?: string[];
}

export interface LanguageProficiencySchema {
  name: string;
  read: string;
  write: string;
  speak: string;
  listen: string;
  tests?: string[]; // Multiple tests e.g., ["IELTS", "TOEFL"]
  level?: string; // e.g., A1, B1, C1, Good, Fluent
}

export interface ReferenceSchema {
  name: string;
  position: string;
  organization: string;
  email?: string;
  phone?: string;
  relation?: string;
  notes?: string;
}

export interface SocialLinkSchema {
  platform: string;
  url: string;
  username?: string;
  description?: string;
}

export interface ContactSchema {
  type: string;
  value: string;
  label?: string;
  description?: string;
}

export interface BioSchema {
  fullName: string;
  title: string;
  summary: string;
  location: string;
  dob?: string;
  photo?: string;
}

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

export interface ProjectSchema {
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

export interface ExperienceSchema {
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

export interface BlogSchema {
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

export interface GallerySchema {
  title: string;
  image: string;
  category: string;
  description?: string;
  date?: string;
  tags?: string[];
  featured?: boolean;
}

export interface ResumeSchema {
  title: string;
  type: string;
  description?: string;
  icon?: string;
  order?: number;
}
