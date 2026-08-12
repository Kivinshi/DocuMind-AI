// =====================================================
// API BASE URL
// =====================================================

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5026/api"
).trim();


// =====================================================
// TYPES
// =====================================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    userId: number;
    email: string;
    planType: string;
    token: string;
}

export interface DocumentItem {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
}


// =====================================================
// API ERROR
// =====================================================

export class ApiError extends Error {
    status: number;

    constructor(
        message: string,
        status: number
    ) {
        super(message);

        this.name = "ApiError";

        this.status = status;
    }
}


// =====================================================
// GET TOKEN
// =====================================================

export function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {
        return null;
    }

    return token.trim();
}


// =====================================================
// SAVE TOKEN
// =====================================================

export function saveToken(
    token: string
): void {
    if (typeof window === "undefined") {
        return;
    }

    if (!token || !token.trim()) {
        console.error(
            "[Auth] Cannot save empty JWT token."
        );

        return;
    }

    localStorage.setItem(
        "token",
        token.trim()
    );
}


// =====================================================
// REMOVE TOKEN
// =====================================================

export function removeToken(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("token");
}


// =====================================================
// CHECK TOKEN FORMAT
// =====================================================

function isValidJwtFormat(
    token: string
): boolean {

    const parts =
        token.split(".");

    return parts.length === 3;
}


// =====================================================
// READ API ERROR
// =====================================================

async function getErrorMessage(
    response: Response
): Promise<string> {

    const contentType =
        response.headers.get(
            "content-type"
        );

    try {

        // -------------------------------------------------
        // JSON
        // -------------------------------------------------

        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();

            if (
                typeof data?.message ===
                "string"
            ) {
                return data.message;
            }

            if (
                typeof data?.title ===
                "string"
            ) {
                return data.title;
            }

            if (
                typeof data?.detail ===
                "string"
            ) {
                return data.detail;
            }

            return `Request failed with status ${response.status}.`;
        }


        // -------------------------------------------------
        // TEXT
        // -------------------------------------------------

        const text =
            await response.text();

        if (text.trim()) {
            return text.trim();
        }


        return `Request failed with status ${response.status}.`;

    } catch {

        return `Request failed with status ${response.status}.`;
    }
}


// =====================================================
// AUTH HEADERS
// =====================================================

function getAuthHeaders(): HeadersInit {

    const token =
        getToken();

    if (!token) {

        return {
            "Accept":
                "application/json"
        };
    }


    return {
        "Accept":
            "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


// =====================================================
// HANDLE RESPONSE
// =====================================================

async function handleResponse<T>(
    response: Response
): Promise<T> {

    // -------------------------------------------------
    // 401 = Unauthorized
    // -------------------------------------------------

    if (response.status === 401) {

        const message =
            await getErrorMessage(
                response
            );

        console.error(
            "[API] 401 Unauthorized:",
            message
        );

        // Remove invalid/stale token
        removeToken();

        throw new ApiError(
            "Your session has expired or the authentication token is invalid. Please login again.",
            401
        );
    }


    // -------------------------------------------------
    // Other errors
    // -------------------------------------------------

    if (!response.ok) {

        const message =
            await getErrorMessage(
                response
            );

        throw new ApiError(
            message,
            response.status
        );
    }


    // -------------------------------------------------
    // Read response
    // -------------------------------------------------

    const text =
        await response.text();

    if (!text.trim()) {

        return {} as T;
    }


    // -------------------------------------------------
    // Parse JSON
    // -------------------------------------------------

    try {

        return JSON.parse(text) as T;

    } catch {

        throw new ApiError(
            "The server returned an invalid JSON response.",
            response.status
        );
    }
}


// =====================================================
// LOGIN
// POST: /api/Auth/login
// =====================================================

export async function loginUser(
    request: LoginRequest
): Promise<AuthResponse> {

    const response =
        await fetch(
            `${API_URL}/Auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify(request)
            }
        );


    const data =
        await handleResponse<AuthResponse>(
            response
        );


    // -------------------------------------------------
    // Validate JWT
    // -------------------------------------------------

    if (
        !data.token ||
        !data.token.trim()
    ) {

        throw new ApiError(
            "Login succeeded but the server did not return a JWT token.",
            response.status
        );
    }


    if (
        !isValidJwtFormat(
            data.token.trim()
        )
    ) {

        throw new ApiError(
            "The server returned an invalid JWT token.",
            response.status
        );
    }


    // -------------------------------------------------
    // Save token
    // -------------------------------------------------

    saveToken(
        data.token
    );


    return data;
}


// =====================================================
// REGISTER
// POST: /api/Auth/register
// =====================================================

export async function registerUser(
    request: RegisterRequest
): Promise<AuthResponse> {

    const response =
        await fetch(
            `${API_URL}/Auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify(request)
            }
        );


    const data =
        await handleResponse<AuthResponse>(
            response
        );


    // -------------------------------------------------
    // Validate JWT
    // -------------------------------------------------

    if (
        !data.token ||
        !data.token.trim()
    ) {

        throw new ApiError(
            "Registration succeeded but the server did not return a JWT token.",
            response.status
        );
    }


    if (
        !isValidJwtFormat(
            data.token.trim()
        )
    ) {

        throw new ApiError(
            "The server returned an invalid JWT token.",
            response.status
        );
    }


    // -------------------------------------------------
    // Save token
    // -------------------------------------------------

    saveToken(
        data.token
    );


    return data;
}


// =====================================================
// API GET
// =====================================================

export async function apiGet<T>(
    endpoint: string
): Promise<T> {

    const token =
        getToken();


    // -------------------------------------------------
    // Debug information
    // -------------------------------------------------

    console.log(
        "[API GET]",
        `${API_URL}${endpoint}`
    );

    console.log(
        "[API GET] Token exists:",
        !!token
    );


    // -------------------------------------------------
    // Validate token format
    // -------------------------------------------------

    if (token && !isValidJwtFormat(token)) {

        console.warn(
            "[API GET] Invalid JWT format. Removing token."
        );

        removeToken();

        throw new ApiError(
            "Authentication token is invalid. Please login again.",
            401
        );
    }


    // -------------------------------------------------
    // Request
    // -------------------------------------------------

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                method: "GET",

                headers:
                    getAuthHeaders(),

                cache:
                    "no-store"
            }
        );


    return handleResponse<T>(
        response
    );
}


// =====================================================
// API DELETE
// =====================================================

export async function apiDelete<T>(
    endpoint: string
): Promise<T> {

    const token =
        getToken();


    // -------------------------------------------------
    // Validate token
    // -------------------------------------------------

    if (
        token &&
        !isValidJwtFormat(token)
    ) {

        removeToken();

        throw new ApiError(
            "Authentication token is invalid. Please login again.",
            401
        );
    }


    // -------------------------------------------------
    // Request
    // -------------------------------------------------

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                method: "DELETE",

                headers:
                    getAuthHeaders(),

                cache:
                    "no-store"
            }
        );


    return handleResponse<T>(
        response
    );
}


// =====================================================
// API POST FILE
// =====================================================

export async function apiUploadFile<T>(
    endpoint: string,
    file: File
): Promise<T> {

    const token =
        getToken();


    // -------------------------------------------------
    // Check token
    // -------------------------------------------------

    if (!token) {

        throw new ApiError(
            "You are not authenticated. Please login again.",
            401
        );
    }


    if (
        !isValidJwtFormat(token)
    ) {

        removeToken();

        throw new ApiError(
            "Authentication token is invalid. Please login again.",
            401
        );
    }


    // -------------------------------------------------
    // FormData
    // -------------------------------------------------

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );


    // -------------------------------------------------
    // Request
    // -------------------------------------------------

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"
                },

                body:
                    formData
            }
        );


    return handleResponse<T>(
        response
    );
}


// =====================================================
// GET DOCUMENTS
// GET: /api/Documents
// =====================================================

export async function getDocuments():
    Promise<DocumentItem[]> {

    return apiGet<DocumentItem[]>(
        "/Documents"
    );
}


// =====================================================
// UPLOAD DOCUMENT
// POST: /api/Documents/upload
// =====================================================

export async function uploadDocument(
    file: File
): Promise<unknown> {

    return apiUploadFile(
        "/Documents/upload",
        file
    );
}


// =====================================================
// DELETE DOCUMENT
// DELETE: /api/Documents/{id}
// =====================================================

export async function deleteDocument(
    id: number
): Promise<unknown> {

    return apiDelete(
        `/Documents/${id}`
    );
}