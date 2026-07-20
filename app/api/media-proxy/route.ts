import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "https://xyz.travel.api.progressivebyte.com";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
  /\/$/,
  "",
);

const isAllowedApiUrl = (value: string) => {
  try {
    const target = new URL(value);
    const apiBase = new URL(API_BASE_URL);

    return target.origin === apiBase.origin;
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src")?.trim() ?? "";

  if (!src || !isAllowedApiUrl(src)) {
    return NextResponse.json({ message: "Invalid media source." }, { status: 400 });
  }

  const upstream = await fetch(src, {
    method: "GET",
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "Unable to load media." }, { status: upstream.status || 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  const contentLength = upstream.headers.get("content-length");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
