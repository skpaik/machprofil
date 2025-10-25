export interface SkillCategory  {
    category: string;
    items: string[];
}


export interface  Certification {
    name: string;
    organization: string;
    issueDate: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    skills?: string[];
    media?: string[];
    description?: string;
};