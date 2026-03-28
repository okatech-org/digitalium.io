import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Middleware: Subdomain Routing + RBAC Metadata
// Routes *.digitalium.io → /org/[subdomain]
// Injects x-route-level header for client guards
// ═══════════════════════════════════════════════

const MAIN_DOMAINS = [
    "digitalium.io",
    "www.digitalium.io",
    "localhost",
    "127.0.0.1",
];

// Domains that should always bypass subdomain routing
const BYPASS_SUFFIXES = [
    ".run.app",        // Cloud Run direct URLs
    ".web.app",        // Firebase Hosting preview URLs
    ".firebaseapp.com", // Firebase legacy URLs
];

// ── Route-level access control ──
// Maps route prefixes to required RBAC levels
// Level 0 = system_admin, 1 = platform_admin, 2 = admin, 3-5 = membre
const ROUTE_LEVELS: Record<string, { maxLevel: number; label: string }> = {
    "/admin":         { maxLevel: 1, label: "Admin Plateforme" },
    "/sysadmin":      { maxLevel: 0, label: "Administrateur Système" },
    "/subadmin":      { maxLevel: 2, label: "Administrateur Organisation" },
    "/inst": { maxLevel: 5, label: "Espace Institutionnel" },
    "/pro":           { maxLevel: 5, label: "Espace Professionnels" },
};

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const hostWithoutPort = hostname.split(":")[0];

    // Skip for main domain (no subdomain)
    const isMainDomain = MAIN_DOMAINS.some((main) => hostWithoutPort === main);

    // Skip for Cloud Run / Firebase Hosting / other infra domains
    const isBypassDomain = BYPASS_SUFFIXES.some((suffix) => hostWithoutPort.endsWith(suffix));

    const response = isMainDomain || isBypassDomain
        ? NextResponse.next()
        : handleSubdomainRouting(request, hostWithoutPort);

    // ── Inject RBAC metadata headers ──
    const path = request.nextUrl.pathname;
    for (const [prefix, config] of Object.entries(ROUTE_LEVELS)) {
        if (path.startsWith(prefix)) {
            response.headers.set("x-route-level", String(config.maxLevel));
            response.headers.set("x-route-label", config.label);
            response.headers.set("x-route-space", prefix.replace("/", ""));
            break;
        }
    }

    return response;
}

function handleSubdomainRouting(request: NextRequest, hostWithoutPort: string): NextResponse {
    // Extract subdomain from hostname
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
