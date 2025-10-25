export interface SkillCategory {
    category: string;
    items: string[];
}


export interface Certification {
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


export interface Publication {
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

export interface LanguageProficiency {
    name: string;
    read: string;
    write: string;
    speak: string;
    listen: string;
    tests?: string[]; // Multiple tests e.g., ["IELTS", "TOEFL"]
    level?: string;   // e.g., A1, B1, C1, Good, Fluent
}