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