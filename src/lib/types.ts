export type Job = {
    id: string;
    slug: string;
    title: string;
    department: string | null;
    status: 'active' | 'inactive' | 'draft';
    salary_min: number | null;
    salary_max: number | null;
    currency: string | null;
    salary_display: string | null;
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