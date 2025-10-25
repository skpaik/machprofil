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


export interface Reference {
    name: string;
    position: string;
    organization: string;
    email?: string;
    phone?: string;
    relation?: string;
    notes?: string;
}

export interface SocialLink {
    platform: string;
    url: string;
    username?: string;
    description?: string;
}

export interface Contact {
    type: string;
    value: string;
    label?: string;
    description?: string;
}

export interface Bio {
    fullName: string;
    title: string;
    summary: string;
    location: string;
    dob?: string;
    photo?: string;
};