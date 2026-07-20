const DEFAULT_API_BASE_URL = "https://xyz.travel.api.progressivebyte.com";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
  /\/$/,
  "",
);

export const resolveApiUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed.replace(/^\/+/, "")}`;
};

export const resolveEmbeddableApiUrl = (value: string) => {
  const absoluteUrl = resolveApiUrl(value);

  if (!absoluteUrl) {
    return "";
  }

  return absoluteUrl.startsWith(API_BASE_URL)
    ? `/api/media-proxy?src=${encodeURIComponent(absoluteUrl)}`
    : absoluteUrl;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseApiResponse = async <T>(response: Response): Promise<ApiEnvelope<T> | null> => {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
};

const buildRequestInit = (options: ApiRequestOptions = {}): RequestInit => {
  const { body, headers, ...rest } = options;
  const isFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;

  return {
    ...rest,
    headers: {
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...(headers ?? {}),
    },
    body:
      body === undefined
        ? undefined
        : isFormDataBody
          ? body
          : JSON.stringify(body),
  };
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, buildRequestInit(options));

  const payload = await parseApiResponse<T>(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  if (!payload || typeof payload !== "object" || payload.data === undefined) {
    throw new ApiError("Unexpected API response. Please try again.", response.status);
  }

  return payload.data;
}

export async function apiRequestOptional<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  const response = await fetch(`${API_BASE_URL}${path}`, buildRequestInit(options));

  const payload = await parseApiResponse<T>(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  if (!payload || typeof payload !== "object" || payload.data === undefined) {
    return null;
  }

  return payload.data;
}
