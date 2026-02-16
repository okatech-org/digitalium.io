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

/**
 * Check if a hostname is a "main" domain (not a client subdomain).
 * Includes: main domains, Cloud Run (.run.app), Firebase Hosting
 * (.web.app, .firebaseapp.com), and any non-digitalium.io domain.
 */
function isMainOrInfraHost(hostname: string): boolean {
    const host = hostname.split(":")[0]; // strip port

    // Exact match on known main domains
    if (MAIN_DOMAINS.includes(host)) return true;

    // Cloud Run service URLs (e.g. digitalium-nextjs-*.europe-west1.run.app)
    if (host.endsWith(".run.app")) return true;

    // Firebase Hosting preview channels and defaults
    if (host.endsWith(".web.app")) return true;
    if (host.endsWith(".firebaseapp.com")) return true;

    // Only treat *.digitalium.io as potential client subdomains.
    // Any other domain (e.g. custom domains, IP addresses) should pass through.
    if (!host.endsWith(".digitalium.io")) return true;

    return false;
}

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";

    // Skip for main / infrastructure domains
    if (isMainOrInfraHost(hostname)) {
        return NextResponse.next();
    }

    // Extract subdomain from hostname
    // e.g. "oka-tech.digitalium.io" → "oka-tech"
    const hostWithoutPort = hostname.split(":")[0];
    const parts = hostWithoutPort.split(".");

    // Need at least subdomain.digitalium.io
    if (parts.length < 3) {
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
