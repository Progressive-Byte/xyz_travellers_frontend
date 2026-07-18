import { apiRequest } from "@/lib/api";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  roles: string[];
  profilePhoto?: string;
  bio?: string;
};

export type AuthSuccessData = {
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
};

export const AUTH_TOKEN_KEY = "xyz_auth_token";
export const AUTH_USER_KEY = "xyz_auth_user";

const canUseStorage = () => typeof window !== "undefined";

export async function loginUser(payload: LoginPayload): Promise<AuthSuccessData> {
  return apiRequest<AuthSuccessData>("/api/v1/auth/login", {
    method: "POST",
    body: {
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
    },
  });
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSuccessData> {
  return apiRequest<AuthSuccessData>("/api/v1/auth/register", {
    method: "POST",
    body: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      phone: payload.phone?.trim() || undefined,
      address: payload.address?.trim() || undefined,
    },
  });
}

export function persistAuthSession(session: AuthSuccessData) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function hydrateAuthSession() {
  return {
    token: getStoredToken(),
    user: getStoredUser(),
  };
}
