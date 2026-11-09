import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap first gate: no session cookie means no point rendering the app shell.
 * The API still validates the session on every request, so this is UX, not security.
 * (This only sees the cookie when web and API share a cookie domain; see COOKIE_DOMAIN in the README.)
 */
export function middleware(req: NextRequest) {
  if (!req.cookies.get("cf_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/projects/:path*", "/billing/:path*", "/clips/:path*"] };
