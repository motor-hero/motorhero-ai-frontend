export type Body_login_login_access_token = {
    grant_type?: string | null
    username: string
    password: string
    scope?: string
    client_id?: string | null
    client_secret?: string | null
}

export type HTTPValidationError = {
    detail?: Array<ValidationError>
}

export type ItemCreate = {
    title: string
    description?: string | null
}

export type ItemPublic = {
    title: string
    description?: string | null
    id: string
    owner_id: string
}

export type ItemUpdate = {
    title?: string | null
    description?: string | null
}

export type ItemsPublic = {
    data: Array<ItemPublic>
    count: number
}

export type Message = {
    message: string
}

export type NewPassword = {
    token: string
    new_password: string
}

export type Token = {
    access_token: string
    token_type?: string
}

export type UpdatePassword = {
    current_password: string
    new_password: string
}

export type UserCreate = {
    email: string
    is_active?: boolean
    is_superuser?: boolean
    full_name?: string | null
    password: string
}

export type UserPublic = {
    email: string
    is_active?: boolean
    is_superuser?: boolean
    full_name?: string | null
    id: string
}

export type UserRegister = {
    email: string
    password: string
    full_name?: string | null
}

export type UserUpdate = {
    email?: string | null
    is_active?: boolean
    is_superuser?: boolean
    full_name?: string | null
    password?: string | null
}

export type UserUpdateMe = {
    full_name?: string | null
    email?: string | null
}

export type UsersPublic = {
    data: Array<UserPublic>
    count: number
}

export type ValidationError = {
    loc: Array<string | number>
    msg: string
    type: string
}

export type JobType = 'SCRAPING' | 'ENRICHMENT';

export type PartCreate = {
    code: string;
};

export type JobCreate = {
    type: JobType;
    part_ids: string[];
    service_type: string;
    requested_by_id: string;
    name: string | null;
    file?: File | null;
};

export type JobPublic = {
    id: string; // UUID
    type: JobType;
    status: string; // Could be an enum like 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    error_message?: string | null;
    service_type: string;
    estimated_cost: number;
    estimated_time: number;
    created_at: string;
    updated_at: string;
    requested_by_id: string;
    part_ids: string[];
    parent_id?: string | null;
    name: string;
};

export type JobsPublic = {
    data: Array<JobPublic>;
    count: number;
};

export type ServiceType = {
    id: string;
    name: string;
};


