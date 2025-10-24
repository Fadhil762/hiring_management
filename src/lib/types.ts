export type Job = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    department?: string | null;
    status: 'active' | 'inactive' | 'draft';
    salary_min?: number | null;
    salary_max?: number | null;
    currency?: string | null;
    salary_display?: string | null;
    company?: string | null;
    location?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type ApplicationField = {
    key: string;
    label?: string;
    validation?: {required?: boolean};
};

export type JobConfig = {
    application_form: {
        sections: {title:string; fields: ApplicationField[]}[];
    };
};

export type CandidateAttr = {
    key: string;
    label?: string;
    value?: string;
    order?: number
};

export type Application = {
    id: string;
    job_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    linkedin: string | null;
    domicile: string | null;
    profile_picture: string | null;
    created_at: string;
};