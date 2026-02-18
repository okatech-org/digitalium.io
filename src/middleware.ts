import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Middleware: Subdomain Routing
// Routes *.digitalium.io → /org/[subdomain]
// ═══════════════════════════════════════════════

const MAIN_DOMAINS = [
    "digitalium.io",
    "www.digitalium.io",
    "localhost",
    "127.0.0.1",
];

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";

    // Skip for main domain (no subdomain)
    const isMainDomain = MAIN_DOMAINS.some((main) => {
        // For localhost:3000 etc.
        const host = hostname.split(":")[0];
        return host === main;
    });

    if (isMainDomain) {
        return NextResponse.next();
    }

    // Extract subdomain from hostname
    // e.g. "oka-tech.digitalium.io" → "oka-tech"
    // e.g. "oka-tech.localhost:3000" → "oka-tech"
    const hostWithoutPort = hostname.split(":")[0];
    const parts = hostWithoutPort.split(".");

    // Need at least subdomain + domain parts
    if (parts.length < 2) {
        return NextResponse.next();
    }

    const subdomain = parts[0];

    // Skip "www"
    if (subdomain === "www") {
        return NextResponse.next();
    }

    // Skip internal paths
    const path = request.nextUrl.pathname;
    if (
        path.startsWith("/api") ||
        path.startsWith("/_next") ||
        path.startsWith("/org/") ||
        path === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Rewrite to the org page
    const url = request.nextUrl.clone();
    url.pathname = `/org/${subdomain}${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
