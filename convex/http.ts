// ═══════════════════════════════════════════════
// DIGITALIUM.IO — Convex: HTTP Routes
// Maps external HTTP endpoints to handlers
// ═══════════════════════════════════════════════

import { httpRouter } from "convex/server";
import {
    firebaseAuthWebhook,
    stripeWebhook,
    genericEvent,
} from "./sensoriel";

const http = httpRouter();

// ─── NEOCORTEX Sensoriel Endpoints ──────────────

http.route({
    path: "/sensoriel/firebase-auth",
    method: "POST",
    handler: firebaseAuthWebhook,
});

http.route({
    path: "/sensoriel/stripe",
    method: "POST",
    handler: stripeWebhook,
});

http.route({
    path: "/sensoriel/event",
    method: "POST",
    handler: genericEvent,
});

export default http;
