const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5026/api";

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  planType: string;
  token?: string;
}

export interface ApiError {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.title ||
      "Registration failed."
    );
  }

  return result;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: number;
    email: string;
    planType: string;
    token: string;
}

export async function loginUser(
    data: LoginRequest
): Promise<LoginResponse> {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message ||
            result?.title ||
            "Login failed."
        );
    }

    return result;
}