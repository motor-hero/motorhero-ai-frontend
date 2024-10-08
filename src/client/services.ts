import type {CancelablePromise} from "./core/CancelablePromise"
import {OpenAPI} from "./core/OpenAPI"
import {request as __request} from "./core/request"

import type {
    Body_login_login_access_token,
    ItemCreate,
    ItemPublic,
    ItemUpdate,
    ItemsPublic,
    Message,
    NewPassword,
    Token,
    UpdatePassword,
    UserCreate,
    UserPublic,
    UserRegister,
    UserUpdate,
    UserUpdateMe,
    UsersPublic,
    JobPublic,
    JobCreate,
} from "./models"

export type TDataLoginAccessToken = {
    formData: Body_login_login_access_token
}
export type TDataRecoverPassword = {
    email: string
}
export type TDataResetPassword = {
    requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
    email: string
}
export type TDataGetAvailableServiceTypes = {
    serviceType?: "scraping" | "enrichment";
};

export class LoginService {
    /**
     * Login Access Token
     * OAuth2 compatible token login, get an access token for future requests
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginAccessToken(
        data: TDataLoginAccessToken,
    ): CancelablePromise<Token> {
        const {formData} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/login/access-token",
            formData: formData,
            mediaType: "application/x-www-form-urlencoded",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Test Token
     * Test access token
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static testToken(): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/login/test-token",
        })
    }

    /**
     * Recover Password
     * Password Recovery
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static recoverPassword(
        data: TDataRecoverPassword,
    ): CancelablePromise<Message> {
        const {email} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/password-recovery/{email}",
            path: {
                email,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Reset Password
     * Reset password
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static resetPassword(
        data: TDataResetPassword,
    ): CancelablePromise<Message> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/reset-password/",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Recover Password Html Content
     * HTML Content for Password Recovery
     * @returns string Successful Response
     * @throws ApiError
     */
    public static recoverPasswordHtmlContent(
        data: TDataRecoverPasswordHtmlContent,
    ): CancelablePromise<string> {
        const {email} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/password-recovery-html-content/{email}",
            path: {
                email,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }
}

export type TDataReadUsers = {
    limit?: number
    skip?: number
}
export type TDataCreateUser = {
    requestBody: UserCreate
}
export type TDataUpdateUserMe = {
    requestBody: UserUpdateMe
}
export type TDataUpdatePasswordMe = {
    requestBody: UpdatePassword
}
export type TDataRegisterUser = {
    requestBody: UserRegister
}
export type TDataReadUserById = {
    userId: string
}
export type TDataUpdateUser = {
    requestBody: UserUpdate
    userId: string
}
export type TDataDeleteUser = {
    userId: string
}
export type TDataDeleteJob = {
    jobId: string
}

export class UsersService {
    /**
     * Read Users
     * Retrieve users.
     * @returns UsersPublic Successful Response
     * @throws ApiError
     */
    public static readUsers(
        data: TDataReadUsers = {},
    ): CancelablePromise<UsersPublic> {
        const {limit = 100, skip = 0} = data
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/users/",
            query: {
                skip,
                limit,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Create User
     * Create new user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static createUser(
        data: TDataCreateUser,
    ): CancelablePromise<UserPublic> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/users/",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Read User Me
     * Get current user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static readUserMe(): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/users/me",
        })
    }

    /**
     * Delete User Me
     * Delete own user.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteUserMe(): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/v1/users/me",
        })
    }

    /**
     * Update User Me
     * Update own user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUserMe(
        data: TDataUpdateUserMe,
    ): CancelablePromise<UserPublic> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/users/me",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Update Password Me
     * Update own password.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static updatePasswordMe(
        data: TDataUpdatePasswordMe,
    ): CancelablePromise<Message> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/users/me/password",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Register User
     * Create new user without the need to be logged in.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static registerUser(
        data: TDataRegisterUser,
    ): CancelablePromise<UserPublic> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/users/signup",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Read User By Id
     * Get a specific user by id.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static readUserById(
        data: TDataReadUserById,
    ): CancelablePromise<UserPublic> {
        const {userId} = data
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/users/{user_id}",
            path: {
                user_id: userId,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Update User
     * Update a user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUser(
        data: TDataUpdateUser,
    ): CancelablePromise<UserPublic> {
        const {requestBody, userId} = data
        return __request(OpenAPI, {
            method: "PATCH",
            url: "/api/v1/users/{user_id}",
            path: {
                user_id: userId,
            },
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Delete User
     * Delete a user.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
        const {userId} = data
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/v1/users/{user_id}",
            path: {
                user_id: userId,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }
}

export type TDataTestEmail = {
    emailTo: string
}

export class UtilsService {
    /**
     * Test Email
     * Test emails.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
        const {emailTo} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/utils/test-email/",
            query: {
                email_to: emailTo,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }
}

export type TDataReadItems = {
    limit?: number
    skip?: number
}
export type TDataCreateItem = {
    requestBody: ItemCreate
}
export type TDataReadItem = {
    id: string
}
export type TDataUpdateItem = {
    id: string
    requestBody: ItemUpdate
}
export type TDataDeleteItem = {
    id: string
}

export class ItemsService {
    /**
     * Read Items
     * Retrieve items.
     * @returns ItemsPublic Successful Response
     * @throws ApiError
     */
    public static readItems(
        data: TDataReadItems = {},
    ): CancelablePromise<ItemsPublic> {
        const {limit = 100, skip = 0} = data
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/items/",
            query: {
                skip,
                limit,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Create Item
     * Create new item.
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static createItem(
        data: TDataCreateItem,
    ): CancelablePromise<ItemPublic> {
        const {requestBody} = data
        return __request(OpenAPI, {
            method: "POST",
            url: "/api/v1/items/",
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Read Item
     * Get item by ID.
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
        const {id} = data
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/items/{id}",
            path: {
                id,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Update Item
     * Update an item.
     * @returns ItemPublic Successful Response
     * @throws ApiError
     */
    public static updateItem(
        data: TDataUpdateItem,
    ): CancelablePromise<ItemPublic> {
        const {id, requestBody} = data
        return __request(OpenAPI, {
            method: "PUT",
            url: "/api/v1/items/{id}",
            path: {
                id,
            },
            body: requestBody,
            mediaType: "application/json",
            errors: {
                422: "Validation Error",
            },
        })
    }

    /**
     * Delete Item
     * Delete an item.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
        const {id} = data
        return __request(OpenAPI, {
            method: "DELETE",
            url: "/api/v1/items/{id}",
            path: {
                id,
            },
            errors: {
                422: "Validation Error",
            },
        })
    }
}

export type TDataCreateJob = {
    requestBody: JobCreate;
};

export type TDataReadJobs = {
    limit?: number;
    skip?: number;
};

export type TDataReadJob = {
    id: string;
};

export class JobsService {
    /**
     * Create Job
     * Create a new job (either scraping or enrichment).
     * @returns JobPublic Successful Response
     * @throws ApiError
     */
    public static createScrapingJob(
        formData: FormData,
        queryParams: URLSearchParams
    ): CancelablePromise<JobPublic> {
        return __request(OpenAPI, {
            method: "POST",
            url: `/api/v1/jobs/upload?${queryParams.toString()}`,
            body: formData,
            mediaType: "multipart/form-data", // Ensure the correct media type is used
            errors: {
                422: "Validation Error",
            },
        });
    }

    public static createEnrichmentJob({
                                          jobId,
                                          enrichmentType,
                                      }: {
        jobId: string;
        enrichmentType: string;
    }): CancelablePromise<JobPublic> {
        return __request(OpenAPI, {
            method: "POST",
            url: `/api/v1/jobs/${jobId}/enrich`,
            query: {
                enrichment_type: enrichmentType,
            },
        });
    }

    /**
     * Read Jobs
     * Retrieve a list of jobs with pagination.
     * @returns JobsPublic Successful Response
     * @throws ApiError
     */
    public static readJobs(
        data: TDataReadJobs = {},
    ): CancelablePromise<JobPublic> {
        const {limit = 100, skip = 0} = data;
        return __request(OpenAPI, {
            method: "GET",
            url: "/api/v1/jobs/",
            query: {
                skip,
                limit,
            },
            errors: {
                422: "Validation Error",
            },
        });
    }

    /**
     * Read Job
     * Retrieve a specific job by ID.
     * @returns JobPublic Successful Response
     * @throws ApiError
     */
    public static readJob(
        data: TDataReadJob,
    ): CancelablePromise<JobPublic> {
        const {id} = data;
        return __request(OpenAPI, {
            method: "GET",
            url: `/api/v1/jobs/${id}`,
            errors: {
                422: "Validation Error",
            },
        });
    }

    /**
     * Delete Job
     * Delete a specific job by ID.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static deleteJob(data: TDataDeleteJob): CancelablePromise<Message> {
        const {jobId} = data;
        return __request(OpenAPI, {
            method: "DELETE",
            url: `/api/v1/jobs/${jobId}`,
            errors: {
                422: "Validation Error",
            },
        });
    }

    /**
     * Estimate Job Cost and Time
     * Estimate the cost and time for a specific job.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static estimateJob(
        data: TDataReadJob,
    ): CancelablePromise<JobPublic> {
        const {id} = data;
        return __request(OpenAPI, {
            method: "POST",
            url: `/api/v1/jobs/${id}/estimate`,
            errors: {
                422: "Validation Error",
            },
        });
    }

    public static getServiceTypes(): CancelablePromise<{
        scraping: string[];
        enrichment: string[];
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/jobs/service-types',
        });
    }

    public static runScrapingJob(jobId: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: `/api/v1/jobs/${jobId}/run-scraping`,
        });
    }

    public static runEnrichmentJob(jobId: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "POST",
            url: `/api/v1/jobs/${jobId}/run-enrichment`,
        });
    }

    public static getJob(jobId: string): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: "GET",
            url: `/api/v1/jobs/${jobId}`,
        });
    }

    public static downloadEnrichedParts(jobId: string): CancelablePromise<Response> {
        return __request(OpenAPI, {
            method: "GET",
            url: `/api/v1/jobs/${jobId}/download-enriched`,
            responseType: "blob",
        }).then(response => {
            return new Response(response, {
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });
        });
    }

    public static downloadScrapedParts(jobId: string): CancelablePromise<Response> {
        return __request(OpenAPI, {
            method: "GET",
            url: `/api/v1/jobs/${jobId}/download-scraped`,
            responseType: "blob",
        }).then(response => {
            return new Response(response, {
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });
        });
    }

    public static downloadImages(jobId: string): Promise<Response> {
        return fetch(`${OpenAPI.BASE}/api/v1/jobs/${jobId}/download-images`, {
            method: "GET",
        });
    }

    public static verifyPart(partId: string, data: {
        is_verified: boolean,
        enriched_data: any | null
    }): CancelablePromise<any> {
        const body: any = {
            is_verified: data.is_verified
        };

        if (data.enriched_data !== null) {
            body.enriched_corrected_data = JSON.stringify(data.enriched_data);
        }

        return __request(OpenAPI, {
            method: 'POST',
            url: `/api/v1/parts/${partId}/verify`,
            body: body,
        });
    }

    public static getDashboardData(params: {
        job_type?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        page?: number;
        page_size?: number;
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/dashboard/',
            query: params,
        });
    }

    public static async addPartImage(
        partId: string,
        formData: FormData
    ): Promise<any> {
        console.log(`Adding image for part: ${partId}`);
        return __request(OpenAPI, {
            method: 'POST',
            url: `/api/v1/parts/images/${partId}`,
            body: formData,
            mediaType: 'multipart/form-data',
        });
    }

    public static async deletePartImage(
        imageId: string
    ): Promise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/api/v1/parts/images/${imageId}`,
        });
    }

    public static async replacePartImage(
        partImageId: string,
        file: File
    ): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        return __request(OpenAPI, {
            method: 'PUT',
            url: `/api/v1/parts/images/${partImageId}`,
            body: formData,
            mediaType: 'multipart/form-data',
        });
    }

}
