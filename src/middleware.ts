import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/inbox",
  "/contacts",
  "/pipelines",
  "/broadcasts",
  "/automations",
  "/settings",
];

const authPaths = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("wacrm_session")?.value);
  const { pathname } = request.nextUrl;

  if (hasSession && authPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    const inviteToken = request.nextUrl.searchParams.get("invite");

    if (inviteToken && (pathname === "/login" || pathname === "/signup")) {
      url.pathname = `/join/${encodeURIComponent(inviteToken)}`;
    } else {
      url.pathname = "/dashboard";
    }

    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!hasSession && protectedPaths.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    !hasSession &&
    pathname.startsWith("/api/whatsapp/") &&
    !pathname.includes("/webhook")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
